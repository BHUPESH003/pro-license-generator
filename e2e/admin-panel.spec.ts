import { test, expect, Page } from "@playwright/test";

// Test data setup
const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "admin123";
const TEST_USER_EMAIL = "testuser@example.com";

class AdminPanelPage {
  constructor(private page: Page) {}

  async login(email: string = ADMIN_EMAIL, password: string = ADMIN_PASSWORD) {
    await this.page.goto("/admin/login");
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForURL("/admin/dashboard");
  }

  async navigateToUsers() {
    await this.page.click('[data-testid="users-nav-link"]');
    await this.page.waitForURL("/admin/users");
  }

  async navigateToDevices() {
    await this.page.click('[data-testid="devices-nav-link"]');
    await this.page.waitForURL("/admin/devices");
  }

  async navigateToLicenses() {
    await this.page.click('[data-testid="licenses-nav-link"]');
    await this.page.waitForURL("/admin/licenses");
  }

  async searchUsers(query: string) {
    await this.page.fill('[data-testid="user-search-input"]', query);
    await this.page.press('[data-testid="user-search-input"]', "Enter");
    await this.page.waitForTimeout(1000); // Wait for search results
  }

  async filterUsersByRole(role: "admin" | "user") {
    await this.page.selectOption('[data-testid="role-filter"]', role);
    await this.page.waitForTimeout(1000);
  }

  async sortUsersBy(field: string, direction: "asc" | "desc" = "asc") {
    await this.page.click(`[data-testid="sort-${field}"]`);
    if (direction === "desc") {
      await this.page.click(`[data-testid="sort-${field}"]`);
    }
    await this.page.waitForTimeout(1000);
  }

  async exportUsers() {
    await this.page.click('[data-testid="export-users-button"]');
    // Wait for download to start
    const downloadPromise = this.page.waitForEvent("download");
    const download = await downloadPromise;
    return download;
  }

  async getUserRowCount() {
    return await this.page.locator('[data-testid="user-row"]').count();
  }

  async getDeviceRowCount() {
    return await this.page.locator('[data-testid="device-row"]').count();
  }

  async createUser(
    email: string,
    name: string,
    role: "admin" | "user" = "user"
  ) {
    await this.page.click('[data-testid="create-user-button"]');
    await this.page.fill('[data-testid="user-email-input"]', email);
    await this.page.fill('[data-testid="user-name-input"]', name);
    await this.page.selectOption('[data-testid="user-role-select"]', role);
    await this.page.click('[data-testid="save-user-button"]');
    await this.page.waitForSelector('[data-testid="success-message"]');
  }

  async editUser(userEmail: string, newName: string) {
    await this.searchUsers(userEmail);
    await this.page.click(`[data-testid="edit-user-${userEmail}"]`);
    await this.page.fill('[data-testid="user-name-input"]', newName);
    await this.page.click('[data-testid="save-user-button"]');
    await this.page.waitForSelector('[data-testid="success-message"]');
  }

  async deleteUser(userEmail: string) {
    await this.searchUsers(userEmail);
    await this.page.click(`[data-testid="delete-user-${userEmail}"]`);
    await this.page.click('[data-testid="confirm-delete-button"]');
    await this.page.waitForSelector('[data-testid="success-message"]');
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL("/admin/login");
  }
}

test.describe("Admin Panel E2E Tests", () => {
  let adminPage: AdminPanelPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPanelPage(page);
  });

  test.describe("Authentication", () => {
    test("should login with valid admin credentials", async ({ page }) => {
      await adminPage.login();
      await expect(page).toHaveURL("/admin/dashboard");
      await expect(
        page.locator('[data-testid="dashboard-title"]')
      ).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/admin/login");
      await page.fill('[data-testid="email-input"]', "invalid@test.com");
      await page.fill('[data-testid="password-input"]', "wrongpassword");
      await page.click('[data-testid="login-button"]');

      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        "Invalid credentials"
      );
    });

    test("should redirect to login when accessing protected route without auth", async ({
      page,
    }) => {
      await page.goto("/admin/dashboard");
      await expect(page).toHaveURL("/admin/login");
    });

    test("should logout successfully", async ({ page }) => {
      await adminPage.login();
      await adminPage.logout();
      await expect(page).toHaveURL("/admin/login");
    });
  });

  test.describe("Dashboard", () => {
    test.beforeEach(async () => {
      await adminPage.login();
    });

    test("should display dashboard metrics", async ({ page }) => {
      await expect(
        page.locator('[data-testid="total-users-metric"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="total-devices-metric"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="total-licenses-metric"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="active-users-metric"]')
      ).toBeVisible();
    });

    test("should display recent activity", async ({ page }) => {
      await expect(
        page.locator('[data-testid="recent-activity-section"]')
      ).toBeVisible();
      const activityItems = page.locator('[data-testid="activity-item"]');
      await expect(activityItems.first()).toBeVisible();
    });

    test("should navigate to different sections from dashboard", async ({
      page,
    }) => {
      await page.click('[data-testid="view-all-users-link"]');
      await expect(page).toHaveURL("/admin/users");

      await page.goBack();
      await page.click('[data-testid="view-all-devices-link"]');
      await expect(page).toHaveURL("/admin/devices");
    });
  });

  test.describe("User Management", () => {
    test.beforeEach(async () => {
      await adminPage.login();
      await adminPage.navigateToUsers();
    });

    test("should display users list", async ({ page }) => {
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
      const userCount = await adminPage.getUserRowCount();
      expect(userCount).toBeGreaterThan(0);
    });

    test("should search users by email", async ({ page }) => {
      await adminPage.searchUsers("admin");
      const userCount = await adminPage.getUserRowCount();
      expect(userCount).toBeGreaterThanOrEqual(1);

      // Verify search results contain the search term
      const firstUserEmail = await page
        .locator('[data-testid="user-row"]')
        .first()
        .locator('[data-testid="user-email"]')
        .textContent();
      expect(firstUserEmail?.toLowerCase()).toContain("admin");
    });

    test("should filter users by role", async ({ page }) => {
      await adminPage.filterUsersByRole("admin");
      const userCount = await adminPage.getUserRowCount();
      expect(userCount).toBeGreaterThanOrEqual(1);

      // Verify all visible users have admin role
      const roleElements = page.locator('[data-testid="user-role"]');
      const roleCount = await roleElements.count();
      for (let i = 0; i < roleCount; i++) {
        const roleText = await roleElements.nth(i).textContent();
        expect(roleText?.toLowerCase()).toBe("admin");
      }
    });

    test("should sort users by creation date", async ({ page }) => {
      await adminPage.sortUsersBy("createdAt", "desc");

      // Get the first two creation dates and verify they're in descending order
      const firstDate = await page
        .locator('[data-testid="user-row"]')
        .first()
        .locator('[data-testid="user-created-date"]')
        .textContent();
      const secondDate = await page
        .locator('[data-testid="user-row"]')
        .nth(1)
        .locator('[data-testid="user-created-date"]')
        .textContent();

      if (firstDate && secondDate) {
        expect(new Date(firstDate).getTime()).toBeGreaterThanOrEqual(
          new Date(secondDate).getTime()
        );
      }
    });

    test("should export users to CSV", async ({ page }) => {
      const download = await adminPage.exportUsers();
      expect(download.suggestedFilename()).toBe("users-export.csv");
    });

    test("should create a new user", async ({ page }) => {
      const testEmail = `test-${Date.now()}@example.com`;
      await adminPage.createUser(testEmail, "Test User", "user");

      // Search for the newly created user
      await adminPage.searchUsers(testEmail);
      const userCount = await adminPage.getUserRowCount();
      expect(userCount).toBe(1);
    });

    test("should edit an existing user", async ({ page }) => {
      // First create a user to edit
      const testEmail = `edit-test-${Date.now()}@example.com`;
      await adminPage.createUser(testEmail, "Original Name", "user");

      // Edit the user
      await adminPage.editUser(testEmail, "Updated Name");

      // Verify the change
      await adminPage.searchUsers(testEmail);
      const userName = await page
        .locator('[data-testid="user-row"]')
        .first()
        .locator('[data-testid="user-name"]')
        .textContent();
      expect(userName).toBe("Updated Name");
    });

    test("should delete a user", async ({ page }) => {
      // First create a user to delete
      const testEmail = `delete-test-${Date.now()}@example.com`;
      await adminPage.createUser(testEmail, "To Be Deleted", "user");

      // Delete the user
      await adminPage.deleteUser(testEmail);

      // Verify the user is gone
      await adminPage.searchUsers(testEmail);
      const userCount = await adminPage.getUserRowCount();
      expect(userCount).toBe(0);
    });

    test("should handle pagination", async ({ page }) => {
      // Assuming there are more than 25 users, test pagination
      const paginationInfo = page.locator('[data-testid="pagination-info"]');
      await expect(paginationInfo).toBeVisible();

      // Check if next page button exists and is clickable
      const nextButton = page.locator('[data-testid="next-page-button"]');
      if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        // Verify we're on page 2
        const currentPage = await page
          .locator('[data-testid="current-page"]')
          .textContent();
        expect(currentPage).toBe("2");
      }
    });
  });

  test.describe("Device Management", () => {
    test.beforeEach(async () => {
      await adminPage.login();
      await adminPage.navigateToDevices();
    });

    test("should display devices list", async ({ page }) => {
      await expect(page.locator('[data-testid="devices-table"]')).toBeVisible();
      const deviceCount = await adminPage.getDeviceRowCount();
      expect(deviceCount).toBeGreaterThanOrEqual(0);
    });

    test("should filter devices by status", async ({ page }) => {
      await page.selectOption('[data-testid="status-filter"]', "active");
      await page.waitForTimeout(1000);

      // Verify all visible devices have active status
      const statusElements = page.locator('[data-testid="device-status"]');
      const statusCount = await statusElements.count();
      for (let i = 0; i < statusCount; i++) {
        const statusText = await statusElements.nth(i).textContent();
        expect(statusText?.toLowerCase()).toBe("active");
      }
    });

    test("should filter devices by OS", async ({ page }) => {
      await page.fill('[data-testid="os-filter-input"]', "Windows");
      await page.press('[data-testid="os-filter-input"]', "Enter");
      await page.waitForTimeout(1000);

      // Verify search results contain Windows devices
      const osElements = page.locator('[data-testid="device-os"]');
      const osCount = await osElements.count();
      if (osCount > 0) {
        const firstOsText = await osElements.first().textContent();
        expect(firstOsText?.toLowerCase()).toContain("windows");
      }
    });

    test("should export devices to CSV", async ({ page }) => {
      await page.click('[data-testid="export-devices-button"]');
      const downloadPromise = page.waitForEvent("download");
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe("devices-export.csv");
    });
  });

  test.describe("Performance Tests", () => {
    test.beforeEach(async () => {
      await adminPage.login();
    });

    test("should load dashboard within acceptable time", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/admin/dashboard");
      await page.waitForSelector('[data-testid="dashboard-title"]');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test("should handle large user list efficiently", async ({ page }) => {
      await adminPage.navigateToUsers();

      const startTime = Date.now();
      await page.waitForSelector('[data-testid="users-table"]');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test("should handle search operations quickly", async ({ page }) => {
      await adminPage.navigateToUsers();

      const startTime = Date.now();
      await adminPage.searchUsers("test");
      await page.waitForSelector('[data-testid="users-table"]');
      const searchTime = Date.now() - startTime;

      expect(searchTime).toBeLessThan(2000); // Search should complete within 2 seconds
    });
  });

  test.describe("Error Handling", () => {
    test.beforeEach(async () => {
      await adminPage.login();
    });

    test("should handle network errors gracefully", async ({ page }) => {
      // Simulate network failure
      await page.route("**/api/admin/users", (route) => route.abort());

      await adminPage.navigateToUsers();
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        "Failed to load"
      );
    });

    test("should handle server errors gracefully", async ({ page }) => {
      // Simulate server error
      await page.route("**/api/admin/users", (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Server error" }),
        })
      );

      await adminPage.navigateToUsers();
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    test("should show loading states", async ({ page }) => {
      // Delay the API response to test loading state
      await page.route("**/api/admin/users", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        route.continue();
      });

      await adminPage.navigateToUsers();
      await expect(
        page.locator('[data-testid="loading-spinner"]')
      ).toBeVisible();
      await page.waitForSelector('[data-testid="users-table"]');
      await expect(
        page.locator('[data-testid="loading-spinner"]')
      ).not.toBeVisible();
    });
  });
});
