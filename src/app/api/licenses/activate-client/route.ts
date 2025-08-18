import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import Device from "@/models/Device";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, deviceGuid, name, os } = await req.json();

    if (!licenseKey || !deviceGuid || !name || !os) {
      return NextResponse.json(
        { error: "licenseKey, deviceGuid, name and os are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const license = await License.findOne({ licenseKey });
    if (!license) {
      return NextResponse.json({ error: "Invalid license key" }, { status: 404 });
    }

    // Check expiry if present
    if (license.expiryDate && license.expiryDate < new Date()) {
      return NextResponse.json({ error: "License expired" }, { status: 403 });
    }

    // License must belong to a user
    const user = await User.findById(license.userId).select("_id email name address phone");
    if (!user) {
      return NextResponse.json({ error: "Associated user not found" }, { status: 404 });
    }

    // Hard bind: if license already linked to a different device, block
    if (license.deviceId && license.deviceId !== deviceGuid) {
      return NextResponse.json(
        { error: "License already activated on another device" },
        { status: 409 }
      );
    }

    // If a device already exists for this license (regardless of GUID), ensure it matches
    const deviceByLicense = await Device.findOne({ licenseId: license._id });
    if (deviceByLicense && deviceByLicense.deviceGuid && deviceByLicense.deviceGuid !== deviceGuid) {
      return NextResponse.json(
        { error: "License already registered to a different device" },
        { status: 409 }
      );
    }

    // If a device with this GUID already exists
    const existingDevice = await Device.findOne({ deviceGuid });
    if (existingDevice) {
      // Ensure it's tied to the same user/license
      if (
        existingDevice.userId.toString() !== license.userId.toString() ||
        existingDevice.licenseId.toString() !== license._id.toString()
      ) {
        return NextResponse.json(
          { error: "Device GUID already registered to another license/user" },
          { status: 409 }
        );
      }
      existingDevice.name = name;
      existingDevice.os = os;
      existingDevice.lastActivity = new Date();
      await existingDevice.save();

      // Ensure license reflects binding
      if (!license.deviceId) {
        license.deviceId = deviceGuid;
        if (license.status !== "active") license.status = "active";
        await license.save();
      }

      return NextResponse.json({
        success: true,
        user: { id: user._id, email: user.email, name: user.name },
        license: {
          id: license._id,
          licenseKey: license.licenseKey,
          status: license.status,
          expiryDate: license.expiryDate,
          plan: license.plan,
        },
        device: {
          id: existingDevice._id,
          deviceGuid: existingDevice.deviceGuid,
          name: existingDevice.name,
          os: existingDevice.os,
          lastActivity: existingDevice.lastActivity,
        },
      });
    }

    // Create device and link license
    const device = await Device.create({
      name,
      os,
      deviceGuid,
      userId: license.userId,
      licenseId: license._id,
    });

    // Ensure license is active and reflect deviceId for UI display
    if (license.status !== "active") {
      license.status = "active";
    }
    license.deviceId = deviceGuid;
    await license.save();

    return NextResponse.json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name },
      license: {
        id: license._id,
        licenseKey: license.licenseKey,
        status: license.status,
        expiryDate: license.expiryDate,
        plan: license.plan,
      },
      device: {
        id: device._id,
        deviceGuid: device.deviceGuid,
        name: device.name,
        os: device.os,
        lastActivity: device.lastActivity,
      },
    });
  } catch (err: any) {
    if (err?.code === 11000 && err?.keyPattern?.deviceGuid) {
      return NextResponse.json(
        { error: "Device GUID already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to register device" }, { status: 500 });
  }
}


