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
	});
});
