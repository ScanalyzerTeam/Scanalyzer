import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await (async () => {
      try {
        return (await import(`../messages/${locale}.json`)).default;
      } catch (err) {
        // Fallback to default locale messages if the requested locale file is missing
        // This prevents a hard 500 when a locale file is added during development
        // and the dev server hasn't picked it up yet.

        console.warn(
          `Locale messages not found for ${locale}, falling back to ${routing.defaultLocale}`,
          err,
        );
        return (await import(`../messages/${routing.defaultLocale}.json`))
          .default;
      }
    })(),
  };
});
