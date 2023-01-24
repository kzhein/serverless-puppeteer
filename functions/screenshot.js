const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const isDev = process.env.NODE_ENV !== 'production';

const getOptions = async isDev => {
  let options;

  if (isDev) {
    options = {
      args: [],
      executablePath: process.env.CHROME_EXECUTABLE_PATH, // Executable path can be found in chrome://version/
      headless: true,
    };
  } else {
    options = {
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    };
  }

  return options;
};

const getScreenshot = async (url, isDev) => {
  const options = await getOptions(isDev);
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.goto(url);
  return page.screenshot({
    type: 'jpeg',
    quality: 100,
    fullPage: true,
  });
};

exports.handler = async (event, context) => {
  const { url } = event.queryStringParameters;

  if (!url) {
    return {
      statusCode: 400,
      body: 'Url query parameter not included!',
      headers: {
        'Content-Type': 'text/plain',
      },
    };
  }

  try {
    const photoBuffer = await getScreenshot(url, isDev);

    return {
      statusCode: 200,
      body: photoBuffer.toString('base64'),
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
      headers: {
        'Content-Type': 'text/plain',
      },
    };
  }
};
