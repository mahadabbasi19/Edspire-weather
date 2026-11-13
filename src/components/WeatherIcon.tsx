import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Moon,
} from "lucide-react";
export function WeatherIcon({
  code,
  isDay = true,
  size = 30,
}: {
  code: number;
  isDay?: boolean;
  size?: number;
}) {
  const Icon =
    code === 0
      ? isDay
        ? Sun
        : Moon
      : code <= 2
        ? CloudSun
        : code === 3
          ? Cloud
          : code <= 48
            ? CloudFog
            : code <= 57
              ? CloudDrizzle
              : code <= 67
                ? CloudRain
                : code <= 77
                  ? CloudSnow
                  : code <= 82
                    ? CloudRain
                    : code <= 86
                      ? CloudSnow
                      : CloudLightning;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.5} />;
}
