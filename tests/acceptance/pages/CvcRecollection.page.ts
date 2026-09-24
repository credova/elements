import { expect, type Page, type Locator } from '@playwright/test';

class CvcRecollectionJSPage {
  private page: Page;
  private technologyToggle: Locator;
  private cvcForm: Locator;
  private cvcElement: Locator;
  private cardTokenInput: Locator;
  private successModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.technologyToggle = page.getByTestId('js-type-button');
    this.cvcForm = page.locator('form[name="js-cvc-recollection-cvc-form"]');
    this.cvcElement = this.cvcForm.locator('#js-cvc-recollection-cvc-element');
    this.cardTokenInput = this.cvcForm.locator('#js-cvc-recollection-card-token');
    this.successModal = page.getByTestId('capture-modal');
  }

  async goToPage() {
    await this.page.goto('/cvc-recollection');
    await this.technologyToggle.click();
  }

  async isVisible() {
    await expect(this.cvcForm).toBeVisible();
  }

  async cvcElementReady() {
    await expect(
      await this.cvcElement.frameLocator('iframe').locator('#cvc').innerHTML(),
    ).toBeDefined();
  }

  async fillCardTokenInput(value: string) {
    await this.cardTokenInput.fill(value);
    await expect(this.cardTokenInput).toHaveValue(value);
  }

  async fillCvcElementInput(cvc: string) {
    await this.cvcElement.frameLocator('iframe').locator('#cvc').fill(cvc);
  }

  async submitCvcForm() {
    await this.cvcForm.locator('button[type="submit"]').click();
  }

  async expectSuccessModalIsVisible() {
    await expect(this.successModal).toBeVisible();
    await expect(this.successModal).toContainText('Capture successful');
  }
}

class CvcRecollectionReactPage {
  private page: Page;
  private technologyToggle: Locator;
  private cvcForm: Locator;
  private cvcElement: Locator;
  private cardTokenInput: Locator;
  private successModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.technologyToggle = page.getByTestId('react-type-button');
    this.cvcForm = page.locator('form[name="react-cvc-recollection-cvc-form"]');
    this.cvcElement = page.locator('#react-cvc-recollection-cvc-element');
    this.cardTokenInput = page.locator('#react-cvc-recollection-card-token');
    this.successModal = page.getByTestId('capture-modal');
  }

  async goToPage() {
    await this.page.goto('/cvc-recollection');
    await this.technologyToggle.click();
  }

  async isVisible() {
    await expect(this.cvcForm).toBeVisible();
  }

  async cvcElementReady() {
    await expect(
      await this.cvcElement.frameLocator('iframe').locator('#cvc').innerHTML(),
    ).toBeDefined();
  }

  async fillCardTokenInput(value: string) {
    await this.cardTokenInput.fill(value);
    await expect(this.cardTokenInput).toHaveValue(value);
  }

  async fillCvcElementInput(cvc: string) {
    await this.cvcElement.frameLocator('iframe').locator('#cvc').fill(cvc);
  }

  async submitCvcForm() {
    await this.cvcForm.locator('button[type="submit"]').click();
  }

  async expectSuccessModalIsVisible() {
    await expect(this.successModal).toBeVisible();
    await expect(this.successModal).toContainText('Capture successful');
  }
}

export { CvcRecollectionJSPage, CvcRecollectionReactPage };
