const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const broadbandnowscrapper = async (zip, type) => {
  try {
    console.log("Scraping started");
    let content;
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto("https://broadbandnow.com/");

    // fill in the zip code
    await page.waitForSelector(".js-zip-input");
    await page.type(".js-zip-input", zip);
    console.log("Zip code entered");

    // click the search button
    await page.waitForSelector('button[aria-label="Zip Search Button"]');
    await page.click('button[aria-label="Zip Search Button"]');
    console.log("Search button clicked");
    await page.waitForNavigation();

    if (type === "residential") {
      content = await page.content();
      await browser.close();
    } else if (type === "business"){
        console.log("Switching to business tab");
        const pageContent = await page.content();
        const $ = cheerio.load(pageContent);
        const anchor = $('.type-select-nav-v2__anchor').get(1);
        const link = $(anchor).attr('href');
        console.log(link);
        console.log("Navigating to business tab");
        await page.goto(link);
        content = await page.content();
    }

    const providers = parseData(content);
    return providers;
  } catch (error) {
    throw new Error(error);
  }
};

const parseData = (content) => {
  const $ = cheerio.load(content);
  const providers = [];

  $(".l-providers-list__item").each((index, element) => {
    const providerData = {
      name: $(element)
        .find(".f-provider-card__provider-name")
        .text()
        .replace(/\s+/g, " ")
        .trim(),
      logo: $(element).find(".f-provider-card__image").attr("src"),
      rating:
        $(element).find(".ratings__text").text().trim() !== ""
          ? $(element).find(".ratings__text").text().replace(/\s+/g, " ").trim()
          : null,
      ratingUsers:
        $(element).find(".ratings__count").text().trim() !== ""
          ? $(element)
              .find(".ratings__count")
              .text()
              .replace(/\s+/g, " ")
              .trim()
          : null,
      plansStartingAt: $(element)
        .find(".f-provider-card__plans-price")
        .text()
        .replace(/\s+/g, " ")
        .trim(),
      speedUpTo: $(element)
        .find(".f-provider-card__speeds-value")
        .text()
        .replace(/\s+/g, " ")
        .trim(),
      connection: $(element)
        .find(".f-provider-card__connection")
        .text()
        .replace(/\s+/g, " ")
        .trim()
        ?.split(":")[1]
        .trim(),
      availability: $(element)
        .find(".f-provider-card__availability")
        .text()
        .replace(/\s+/g, " ")
        .trim()
        ?.split(":")[1]
        .trim(),
      phone: $(element)
        .find(".f-provider-card__phone-cta-wrapper")
        .text()
        .replace(/\s+/g, " ")
        .trim(),
      link: $(element)
        .find(".f-provider-card__button-cta-wrapper a")
        .attr("href"),
    };
    providers.push(providerData);
  });

  return providers;
};

module.exports = { broadbandnowscrapper };
