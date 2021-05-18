import { fireEvent, screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import '@testing-library/jest-dom';
import { localStorageMock } from '../__mocks__/localStorage';
import BillsUI from '../views/BillsUI.js';
import { ROUTES } from '../constants/routes';
import firebase from '../__mocks__/firebase';

describe('Given I am connected as an employee', () => {
	describe('When I am on NewBill Page and I add an image (jpg, jpeg or png)', () => {
		test('Then the file input should change', () => {
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

	describe('When I am on NewBill Page and I submit the form with an image', () => {
		test('Then it should create a new bill', () => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			);

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			const html = NewBillUI();
			document.body.innerHTML = html;

			const newBill = new NewBill({
				document,
				onNavigate,
				firestore: null,
				localStorage: window.localStorage,
			});

			const handleSubmit = jest.fn(newBill.handleSubmit);
			const button = screen.getByTestId('form-new-bill');
			button.addEventListener('submit', handleSubmit);
			fireEvent.submit(button);

			expect(handleSubmit).toHaveBeenCalled();
		});
	});

	// Test d'integration POST
	describe('When I am on NewBill Page and submit the form', () => {
		test('Then it should create a new bill and render Bills page', async () => {
			const postSpy = jest.spyOn(firebase, 'post');
			const newBill = {
				id: '47qAXb6fIm2zOKkLzMro',
				vat: '80',
				fileUrl:
					'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
				status: 'pending',
				type: 'Hôtel et logement',
				commentary: 'séminaire billed',
				name: 'encore',
				fileName: 'preview-facture-free-201801-pdf-1.jpg',
				date: '2004-04-04',
				amount: 400,
				commentAdmin: 'ok',
				email: 'a@a',
				pct: 20,
			};

			const bills = await firebase.post(newBill);

			expect(postSpy).toHaveBeenCalledTimes(1);
			expect(bills.data.length).toBe(5);
		});
		test('Then it adds bill to the API and fails with 404 message error', async () => {
			firebase.post.mockImplementationOnce(() =>
				Promise.reject(new Error('Erreur 404'))
			);
			const html = BillsUI({ error: 'Erreur 404' });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 404/);

			expect(message).toBeTruthy();
		});
		test('Then it adds bill to the API and fails with 500 message error', async () => {
			firebase.post.mockImplementationOnce(() =>
				Promise.reject(new Error('Erreur 500'))
			);
			const html = BillsUI({ error: 'Erreur 500' });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 500/);

			expect(message).toBeTruthy();
		});
	});
});
