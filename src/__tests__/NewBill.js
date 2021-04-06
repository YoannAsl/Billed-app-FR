import { fireEvent, screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import '@testing-library/jest-dom';
import { localStorageMock } from '../__mocks__/localStorage';
import { ROUTES } from '../constants/routes';
import firebase from '../__mocks__/firebase';

describe('Given I am connected as an employee', () => {
	describe('When I am on NewBill Page and adding a file', () => {
		test("Then the file's extention should be .png, .jpg or .jpeg", () => {
			const html = NewBillUI();
			document.body.innerHTML = html;

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			const newBill = new NewBill({
				document,
				onNavigate,
				firestore: null,
				localStorage: window.localStorage,
			});

			const handleChangeFile = jest.fn((e) => {
				newBill.handleChangeFile(e);
			});

			const fileInput = screen.getByTestId('file');
			fileInput.addEventListener('change', handleChangeFile);
			fireEvent.change(fileInput, {
				target: {
					files: [
						new File(['test.png'], 'test.png', {
							type: 'image/png',
						}),
					],
				},
			});

			expect(handleChangeFile).toHaveBeenCalled();
			expect(fileInput.files[0].name).toBe('test.png');
		});
	});
	describe('When I am on NewBill Page and submit the form', () => {
		test('Then it should post the new bill', async () => {
			// Test d'integration POST
			const bills = await firebase.get();
			const newBill = bills.data[0];
		});
		test('Then it should create a new bill and render Bills page', () => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				'user',
				JSON.stringify({ type: 'Employee' })
			);
			window.localStorage.setItem(
				'email',
				JSON.stringify({ type: 'johndoe@gmail.com' })
			);

			document.body.innerHTML = NewBillUI();

			const dateInput = screen.getByTestId('datepicker');
			fireEvent.change(dateInput, { target: { value: '2021-03-08' } });
			expect(dateInput.value).toBe('2021-03-08');

			const amountInput = screen.getByTestId('amount');
			fireEvent.change(amountInput, { target: { value: '1' } });
			expect(amountInput.value).toBe('1');

			const tvaPctInput = screen.getByTestId('pct');
			fireEvent.change(tvaPctInput, { target: { value: '20' } });
			expect(tvaPctInput.value).toBe('20');

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			const newBill = new NewBill({
				document,
				onNavigate,
				firestore: null,
				localStorage: window.localStorage,
			});

			const handleChangeFile = jest.fn((e) => {
				newBill.handleChangeFile(e);
			});

			const fileInput = screen.getByTestId('file');
			fileInput.addEventListener('change', handleChangeFile);
			fireEvent.change(fileInput, {
				target: {
					files: [
						new File(['test.png'], 'test.png', {
							type: 'image/png',
						}),
					],
				},
			});

			const form = screen.getByTestId('form-new-bill');
			const handleSubmit = jest.fn(newBill.handleSubmit);
			form.addEventListener('submit', handleSubmit);
			fireEvent.submit(form);
			expect(handleSubmit).toHaveBeenCalled();
			expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
		});
	});
});
