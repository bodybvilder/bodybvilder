import React from "react";

export default function Logo({ color = "white", size = 40 }) {
  const filters = {
    accent: "brightness(0) saturate(100%) invert(77%) sepia(82%) saturate(538%) hue-rotate(78deg) brightness(104%) contrast(101%)",
    dark: "brightness(0) saturate(100%) invert(4%) sepia(6%) saturate(1694%) hue-rotate(202deg) brightness(95%) contrast(92%)",
    white: "none"
  };
  return <img src="/bodybvilder_logo_clean.png" alt="BODYBVILDER" width={size} height={size * 1.67} style={{ display: "block", filter: filters[color] || "none", objectFit: "contain" }} draggable={false} />;
}
