import { AnyAction } from 'redux';
import { AppDispatch } from 'redux/interfaces';
import { alertAdded, alertDissmissed } from 'redux/reducers/alerts/alertsSlice';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';

export const showSuccessToast = (
  dispatch: AppDispatch,
  id: string,
  message: string
) => {
  dispatch(
    alertAdded({
      id,
      message,
      title: '',
      type: 'success',
      createdAt: Date.now(),
    })
  );

  setTimeout(() => {
    dispatch(alertDissmissed(id));
  }, 3000);
};

export const getAlertAction = (mockStore: typeof mockStoreCreator) =>
  mockStore
    .getActions()
    .find((currentAction: AnyAction) =>
      currentAction.type.startsWith('alerts')
    );
