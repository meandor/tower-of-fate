import React, { useState } from 'react';
import { deleteAccount, deleteData, unlinkData } from '../domain/userService';
import './delete.scss';
import { logger } from '../../logger';
import { signOutUser } from '../domain/loginService';

enum Indication {
  SUCCESS = 0,
  ERROR = 1,
}

interface InfoBoxState {
  indicator: Indication;
  message: string;
}

function unlinkDataFn(setInfoBoxStateFn: any): () => void {
  return () =>
    unlinkData()
      .then((_data) => {
        const infoBoxState: InfoBoxState = {
          indicator: Indication.SUCCESS,
          message:
            'Successfully unlinked all your data. Your calendar should be empty now.',
        };
        return setInfoBoxStateFn(infoBoxState);
      })
      .catch((error) => {
        logger.error('Was not able to unlink data', error);
        const infoBoxState: InfoBoxState = {
          indicator: Indication.ERROR,
          message:
            'There was an error while anonymizing your data. Please try again.',
        };
        return setInfoBoxStateFn(infoBoxState);
      });
}

function deleteDataFn(setInfoBoxStateFn: any): () => void {
  return () =>
    deleteData()
      .then((_data) => {
        const infoBoxState: InfoBoxState = {
          indicator: Indication.SUCCESS,
          message:
            'Successfully deleted all your data. Your calendar should be empty now.',
        };
        return setInfoBoxStateFn(infoBoxState);
      })
      .catch((error) => {
        logger.error('Was not able to delete data', error);
        const infoBoxState: InfoBoxState = {
          indicator: Indication.ERROR,
          message:
            'There was an error while deleting your data. Please try again.',
        };
        return setInfoBoxStateFn(infoBoxState);
      });
}

function deleteAccountFn(setInfoBoxStateFn: any): () => void {
  return () =>
    deleteAccount()
      .then((_data) => {
        const infoBoxState: InfoBoxState = {
          indicator: Indication.SUCCESS,
          message:
            'Successfully deleted all your account. You will need to login now.',
        };
        setInfoBoxStateFn(infoBoxState);
        setTimeout(() => '', 1000);
        signOutUser();
        window.location.href = '/';
        return undefined;
      })
      .catch((error) => {
        logger.error('Was not able to delete account', error);
        const infoBoxState: InfoBoxState = {
          indicator: Indication.ERROR,
          message:
            'There was an error while deleting your account. Please try again.',
        };
        return setInfoBoxStateFn(infoBoxState);
      });
}

function renderInfoBox(infoBoxState: InfoBoxState | null): JSX.Element {
  if (!infoBoxState) {
    return <></>;
  }
  if (infoBoxState.indicator === Indication.SUCCESS) {
    return (
      <p className="delete_account__infobox-success" data-testid="info-box">
        {infoBoxState.message}
      </p>
    );
  }
  return (
    <p className="delete_account__infobox-error" data-testid="info-box">
      {infoBoxState.message}
    </p>
  );
}

export function Delete(_props: any): JSX.Element {
  const [infoBoxState, setInfoBoxState] = useState<InfoBoxState | null>(null);

  return (
    <section className="delete_account">
      <h2>Delete your account or data</h2>
      {renderInfoBox(infoBoxState)}
      <section className="delete_account__content">
        <section className="delete_account__description">
          <strong>Anonymize all data except account data</strong>
          <br />
          This will disconnect the data you have given us from your account.
          This means your data can no longer be traced back to you. We will
          though still keep your account but it will no longer have any of the
          previous data (except for account data) associated with it. This means
          we can still use for example your period data to more accurately
          predict periods but we do not know which of the period data is yours.
        </section>
        <section className="delete_account__action">
          <button
            type="button"
            className="button button-primary"
            data-testid="unlink-data"
            onClick={unlinkDataFn(setInfoBoxState)}
          >
            Anonymize Data
          </button>
        </section>

        <section className="delete_account__description">
          <strong>Delete my period data</strong>
          <br />
          This will delete all your data you have given us about you except your
          account data. All your inserted Periods will no longer be usable by
          you or us for example better predictions for other people with similar
          periods.
        </section>
        <section className="delete_account__action">
          <button
            className="button button-primary"
            data-testid="delete-data"
            type="button"
            onClick={deleteDataFn(setInfoBoxState)}
          >
            Delete Data
          </button>
        </section>

        <section className="delete_account__description">
          <strong>Delete my account completely</strong>
          <br />
          This will delete your account with us. This means you can no longer
          login and use our services. You will be logged out after taken this
          action. By default your period data will be kept and unlinked from
          your account. This way we can still use it to help other people
          predict their periods more accurately. If this is not what you want,
          please make sure to delete your data before deleting your account (the
          button above this one).
        </section>
        <section className="delete_account__action">
          <button
            type="button"
            className="button button-secondary"
            data-testid="delete-account"
            onClick={deleteAccountFn(setInfoBoxState)}
          >
            Delete Account
          </button>
        </section>
      </section>
    </section>
  );
}
