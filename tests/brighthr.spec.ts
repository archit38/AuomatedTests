import { test, expect } from '@playwright/test';

test.describe('BrightHR Login and Navigation', () => {
  const employees = [
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' }
  ];
  let employeeProfileUrls: string[] = [];

  // Constants for Selectors
  const selectors = {
    loginPageTitle: /Bright - Login/,
    emailInput: 'input[name="email"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
    dashboardGreeting: 'h3:has-text("Hi, Shilpa")',
    employeesLink: 'a[data-e2e="employees"]',
    employeeHubTitle: 'h1:has-text("Employee hub")',
    addEmployeeButton: 'button:has-text("Add employee")',
    addEmployeeDialog: 'div[role="dialog"]',
    addEmployeeFormTitle: 'h1:has-text("Add employee")',
    firstNameInput: 'input[name="firstName"]',
    lastNameInput: 'input[name="lastName"]',
    emailInputField: 'input[name="email"]',
    phoneNumberInput: 'input[name="phoneNumber"]',
    jobTitleInput: 'input[name="jobTitle"]',
    saveEmployeeButton: 'button:has-text("Save new employee")',
    successMessage: 'h1:has-text("Success! New employee added")',
    closeModalButton: 'button[aria-label="Close modal"]',
    employeeCount: 'h3:has-text("Employees (")',
    deleteCheckBox: 'input[data-testid="deleteCheckBox"]',
    deleteButton: 'button:has-text("Delete")',
    modal: 'div[data-testid="background"]',
    returnToEmployeeHubButton: 'button:has-text("Return to employee hub")'
  };

  // Helper Functions
  const login = async (page) => {
    await page.goto('https://sandbox-login.brighthr.com/login');
    await page.fill(selectors.emailInput, 'gacaxak713@orsbap.com');
    await page.fill(selectors.passwordInput, 'A1234567890B');
    await page.click(selectors.submitButton);
    await page.waitForURL('**/dashboard');
    await expect(page.locator(selectors.dashboardGreeting)).toBeVisible();
  };

  const navigateToEmployeeHub = async (page) => {
    await page.click(selectors.employeesLink);
    await page.waitForLoadState('networkidle');
    await expect(page.locator(selectors.employeeHubTitle)).toBeVisible();
  };

  const addEmployee = async (page, employee) => {
    await page.click(selectors.addEmployeeButton);
    await page.waitForSelector(selectors.addEmployeeDialog);
    await expect(page.locator(selectors.addEmployeeFormTitle)).toBeVisible();
    await page.fill(selectors.firstNameInput, employee.firstName);
    await page.fill(selectors.lastNameInput, employee.lastName);
    await page.fill(selectors.emailInputField, employee.email);
    await page.fill(selectors.phoneNumberInput, '1234567890');
    await page.fill(selectors.jobTitleInput, 'Software Engineer');
    await page.click(selectors.saveEmployeeButton);
    await page.waitForSelector(selectors.successMessage);
    await expect(page.locator(selectors.successMessage)).toBeVisible();
    await page.click(selectors.closeModalButton);
    await expect(page.locator(selectors.addEmployeeDialog)).not.toBeVisible();
    await page.waitForSelector(`text=${employee.firstName} ${employee.lastName}`);
    await expect(page.locator(`text=${employee.firstName} ${employee.lastName}`)).toBeVisible();
    await expect(page.locator(selectors.employeeCount)).toBeVisible();
  };

  const editEmployee = async (page, employee) => {
    await page.click(`h1:has-text("${employee.firstName} ${employee.lastName}") >> xpath=ancestor::div[contains(@class, "flex items-center justify-between")]//a[@data-testid="EditButton"]`);
    await page.waitForURL('**/employee-profile/**');
    employeeProfileUrls.push(page.url());
    await expect(page).toHaveURL(/\/employee-profile\/[a-zA-Z0-9-]+$/);
  };

  const deleteEmployee = async (page, employee) => {
    await page.click(`h1:has-text("${employee.firstName} ${employee.lastName}") >> xpath=ancestor::div[contains(@class, "flex items-center justify-between")]//a[@data-testid="EditButton"]`);
    await page.waitForURL('**/employee-profile/**');
    await page.click('a.Tab-gvbPth[href*="/delete"]:has-text("Delete employee record")');
    await page.waitForLoadState('networkidle');
    const deleteCheckbox = await page.$(selectors.deleteCheckBox);
    await page.evaluate((el: HTMLInputElement) => el.click(), deleteCheckbox);
    await page.click(selectors.deleteButton);
    await page.waitForSelector(selectors.modal);
    await expect(page.locator(selectors.modal)).toContainText(`You have succesfully deleted ${employee.firstName} from your records`);
    await page.click(selectors.returnToEmployeeHubButton);
    await page.waitForLoadState('networkidle');
    await expect(page.locator(selectors.employeeHubTitle)).toBeVisible();
    await expect(page.locator(`text=${employee.firstName} ${employee.lastName}`)).not.toBeVisible();
  };

  test('should login, add two employees, edit, delete both employees, and verify employee list', async ({ page }) => {
    await login(page);
    await navigateToEmployeeHub(page);
    
    // Add two employees
    for (const employee of employees) {
      await addEmployee(page, employee);
    }

    // Edit and delete both employees
    for (const employee of employees) {
      await deleteEmployee(page, employee);
    }

    // Verify final employee count
    const finalCount = await page.locator(selectors.employeeCount).textContent();
    expect(finalCount).toContain('Employees (1)');
  });
});
