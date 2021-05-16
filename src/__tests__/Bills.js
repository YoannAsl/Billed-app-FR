import { fireEvent, screen } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import '@testing-library/jest-dom';
import { localStorageMock } from '../__mocks__/localStorage';
import Bills from '../containers/Bills';
import { ROUTES } from '../constants/routes';
import firebase from '../__mocks__/firebase';

describe('Given I am connected as an employee', () => {
	describe('When I am on Bills Page', () => {
		test('Then bills should be ordered from earliest to latest', () => {
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			const dates = screen
				.getAllByText(
					/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
				)
				.map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);

			expect(dates).toEqual(datesSorted);
		});

		// Test d'intégration GET
		test('Then it should fetch bills from mock API GET', async () => {
			const getSpy = jest.spyOn(firebase, 'get');
			const bills = await firebase.get();

			expect(getSpy).toHaveBeenCalledTimes(1);
			expect(bills.data.length).toBe(4);
		});
		test('Then it fetches bills from an API and fails with 404 message error', async () => {
			firebase.get.mockImplementationOnce(() =>
				Promise.reject(new Error('Erreur 404'))
			);
			const html = BillsUI({ error: 'Erreur 404' });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 404/);

			expect(message).toBeTruthy();
		});
		test('Then it fetches messages from an API and fails with 500 message error', async () => {
			firebase.get.mockImplementationOnce(() =>
				Promise.reject(new Error('Erreur 500'))
			);
			const html = BillsUI({ error: 'Erreur 500' });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 500/);

			expect(message).toBeTruthy();
		});
	});

	describe('When I click on the Create a new bill button', () => {
		test('Then I should be sent to the NewBill page', () => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				'user',
				JSON.stringify({ type: 'Employee' })
			);

			const html = BillsUI({ data: [] });
			document.body.innerHTML = html;

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			const bills = new Bills({
				document,
				onNavigate,
				firestore: null,
				localStorage: window.localStorage,
			});

			const button = screen.getByTestId('btn-new-bill');
			const handleClickNewBill = jest.fn((e) =>
				bills.handleClickNewBill(e)
			);

			button.addEventListener('click', handleClickNewBill);
			fireEvent.click(button);

			expect(
				screen.getAllByText('Envoyer une note de frais')
			).toBeTruthy();
		});
	});

	describe('When I click on the Eye Icon button', () => {
		test('Then a modal should open', () => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				'user',
				JSON.stringify({ type: 'Employee' })
			);

			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			const bills2 = new Bills({
				document,
				onNavigate,
				firestore: null,
				localStorage: window.localStorage,
			});

			$.fn.modal = jest.fn();
			const button = screen.getAllByTestId('icon-eye')[0];
			const handleClickIconEye = jest.fn((e) => {
				e.preventDefault();
				bills2.handleClickIconEye(button);
			});
			button.addEventListener('click', handleClickIconEye);
			fireEvent.click(button);

			expect(document.getElementById('modaleFile')).toBeTruthy();
		});
	});
});
