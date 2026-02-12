import { NextRequest } from "next/server";
import { getAllVersions, getVersion } from "@/lib/versionStore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const versionNum = searchParams.get("version");

  if (versionNum) {
    const version = getVersion(parseInt(versionNum, 10));
    if (!version) {
      return new Response(JSON.stringify({ error: "Version not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(version), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const versions = getAllVersions().map((v) => ({
    version: v.version,
    timestamp: v.timestamp,
    explanation: v.explanation,
  }));

  return new Response(JSON.stringify({ versions }), {
    headers: { "Content-Type": "application/json" },
  });
}
