import { screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import '@testing-library/jest-dom';

describe('Given I am connected as an employee', () => {
	describe('When I am on NewBill Page and adding a file', () => {
		test("Then the file's extention should be .png, .jpg or .jpeg", () => {
			const html = NewBillUI();
			document.body.innerHTML = html;
			//to-do write assertion
			expect(screen.queryByTestId('file')).toHaveValue(
				'.png' || '.jpg' || '.jpeg'
			);
		});
	});
});
