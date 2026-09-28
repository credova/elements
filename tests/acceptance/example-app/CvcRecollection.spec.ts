import test, { expect } from '@playwright/test';
import { CvcRecollectionJSPage, CvcRecollectionReactPage } from '../pages/CvcRecollection.page';

const EXISTING_CARD_ID = 'card_2f9jGnvKcQz8k1yqQpXqRe';
const EXISTING_CARD_TOKEN = 'token_2f9jGnvKcQz8k1yqQpXqRe';
const SESSION_KEY = 'key_test_us_session_fake';
const SESSION_NONCE = 'nonce_fake';

const fakeUpdatedToken = {
  id: EXISTING_CARD_TOKEN,
  type: 'card',
  createdAt: '2024-06-24T13:51:24.9801189+00:00',
  modifiedAt: '2026-09-21T13:51:24.9801189+00:00',
};

// updateCvc() flow:
// 1. BT POST /sessions from the SDK, with a public key that has no token permissions
// 2. payments-api POST /payment-methods/cards/{id}/cvc-session with the nonce; it authorizes the
//    session for this card's token and returns the token
// 3. BT PATCH /tokens/{token} from the Elements iframe, with the session key. The CVC only goes
//    here, never to a PSQ or merchant server.
// BT's hosted Elements iframe currently sends element-bearing token updates to
// api.basistheory.com even for test keys, so both BT hosts are mocked.
async function mockCvcUpdate(page) {
  const calls: { sessionRequestBody?: unknown; tokenUpdateApiKey?: string } = {};

  await page.route(/^https:\/\/api(\.test)?\.basistheory\.com\/sessions\/?$/, async (route) => {
    await route.fulfill({
      json: {
        session_key: SESSION_KEY,
        nonce: SESSION_NONCE,
        expires_at: '2026-09-25T12:03:00+00:00',
      },
    });
  });

  await page.route('**/payment-methods/cards/*/cvc-session', async (route) => {
    calls.sessionRequestBody = route.request().postDataJSON();
    await route.fulfill({
      json: { token: EXISTING_CARD_TOKEN, expires_at: '2026-09-25T12:03:00+00:00' },
    });
  });

  await page.route(/^https:\/\/api(\.test)?\.basistheory\.com\/tokens\//, async (route) => {
    calls.tokenUpdateApiKey = route.request().headers()['bt-api-key'];
    await route.fulfill({ json: fakeUpdatedToken });
  });

  return calls;
}

test.describe('js', () => {
  test.beforeEach(async ({ page }) => {
    const cvcPage = new CvcRecollectionJSPage(page);
    await cvcPage.goToPage();

    await cvcPage.isVisible();
    await cvcPage.cvcElementReady();
  });

  test('attaches a re-entered CVV to an existing card', async ({ page }) => {
    const calls = await mockCvcUpdate(page);

    const cvcPage = new CvcRecollectionJSPage(page);

    await cvcPage.fillCardIdInput(EXISTING_CARD_ID);
    await cvcPage.fillCvcElementInput('456');
    await cvcPage.submitCvcForm();

    await cvcPage.expectSuccessModalIsVisible();
    expect(calls.sessionRequestBody).toEqual({ nonce: SESSION_NONCE });
    expect(calls.tokenUpdateApiKey).toBe(SESSION_KEY);
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

    await cvcPage.fillCardIdInput(EXISTING_CARD_ID);
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

  test('attaches a re-entered CVV to an existing card', async ({ page }) => {
    await mockCvcUpdate(page);

    const cvcPage = new CvcRecollectionReactPage(page);

    await cvcPage.fillCardIdInput(EXISTING_CARD_ID);
    await cvcPage.fillCvcElementInput('456');
    await cvcPage.submitCvcForm();

    await cvcPage.expectSuccessModalIsVisible();
  });
});
