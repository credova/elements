import test, { expect } from '@playwright/test';
import { CvcRecollectionJSPage, CvcRecollectionReactPage } from '../pages/CvcRecollection.page';

const EXISTING_CARD_TOKEN = 'token_2f9jGnvKcQz8k1yqQpXqRe';

const fakeUpdatedToken = {
  id: EXISTING_CARD_TOKEN,
  type: 'card',
  createdAt: '2024-06-24T13:51:24.9801189+00:00',
  modifiedAt: '2026-09-21T13:51:24.9801189+00:00',
};

// The BT Elements SDK sends the CVC update straight from the browser to the BT
// tokens endpoint (PATCH /tokens/{id}) — it never goes through our proxy, and
// never reaches a PSQ or merchant server.
// BT's hosted Elements iframe always sends element-bearing token updates to
// api.basistheory.com, even for test keys, so that's the host mocked here.
async function mockCvcUpdate(page) {
  await page.route('https://api.basistheory.com/tokens/**', async (route) => {
    await route.fulfill({ json: fakeUpdatedToken });
  });
}

test.describe('js', () => {
  test.beforeEach(async ({ page }) => {
    const cvcPage = new CvcRecollectionJSPage(page);
    await cvcPage.goToPage();

    await cvcPage.isVisible();
    await cvcPage.cvcElementReady();
  });

  test('attaches a re-entered CVV to an existing card token', async ({ page }) => {
    await mockCvcUpdate(page);

    const cvcPage = new CvcRecollectionJSPage(page);

    await cvcPage.fillCardTokenInput(EXISTING_CARD_TOKEN);
    await cvcPage.fillCvcElementInput('456');
    await cvcPage.submitCvcForm();

    await cvcPage.expectSuccessModalIsVisible();
  });

  test('the recollected CVV never reaches a PSQ or merchant server', async ({ page }) => {
    await mockCvcUpdate(page);

    let sawCvcOnAnyRequestToOurServers = false;
    page.on('request', (request) => {
      const url = request.url();
      const isOurServer =
        url.includes('publicsquare.com') || url.startsWith('http://127.0.0.1:3000/api');
      if (isOurServer && request.postData()?.includes('456')) {
        sawCvcOnAnyRequestToOurServers = true;
      }
    });

    const cvcPage = new CvcRecollectionJSPage(page);

    await cvcPage.fillCardTokenInput(EXISTING_CARD_TOKEN);
    await cvcPage.fillCvcElementInput('456');
    await cvcPage.submitCvcForm();
    await cvcPage.expectSuccessModalIsVisible();

    expect(sawCvcOnAnyRequestToOurServers).toBe(false);
  });
});

test.describe('react', () => {
  test.beforeEach(async ({ page }) => {
    const cvcPage = new CvcRecollectionReactPage(page);
    await cvcPage.goToPage();

    await cvcPage.isVisible();
    await cvcPage.cvcElementReady();
  });

  test('attaches a re-entered CVV to an existing card token', async ({ page }) => {
    await mockCvcUpdate(page);

    const cvcPage = new CvcRecollectionReactPage(page);

    await cvcPage.fillCardTokenInput(EXISTING_CARD_TOKEN);
    await cvcPage.fillCvcElementInput('456');
    await cvcPage.submitCvcForm();

    await cvcPage.expectSuccessModalIsVisible();
  });
});
