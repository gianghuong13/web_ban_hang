import React from "react";
import { Field, reduxForm } from "redux-form";
import { compose } from "redux";
import renderFormGroupField from "../../helpers/renderFormGroupField";
import renderFormFileInput from "../../helpers/renderFormFileInput";
import {fetchToken, fetchUserId} from "../Auth";
import axios from 'axios';
import {
  required,
  maxLengthMobileNo,
  minLengthMobileNo,
  digit,
  name,
  email,
} from "../../helpers/validation";
import { ReactComponent as IconPerson } from "bootstrap-icons/icons/person.svg";
import { ReactComponent as IconPhone } from "bootstrap-icons/icons/phone.svg";
import { ReactComponent as IconEnvelop } from "bootstrap-icons/icons/envelope.svg";
import { ReactComponent as IconGeoAlt } from "bootstrap-icons/icons/geo-alt.svg";
import { ReactComponent as IconCalendarEvent } from "bootstrap-icons/icons/calendar-event.svg";

const handleSubmit = async (event) => {
  console.log('handleSubmit called');

  event.preventDefault();

  const mobileNumber = event.target.elements.mobileNumber.value;
  const email = event.target.elements.email.value;
  const userId = fetchToken();
  console.log('userId:', userId);
  
  const response = await fetch('http://localhost:5000/account/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${fetchToken()}` // assuming your API uses bearer token authentication
    },
    body: JSON.stringify({
      mobileNumber,
      email,
      userId,
    })
  });

  if (response.ok) {
    const data = await response.json();
    console.log(data.message);
  } else {
    console.error(`HTTP error! status: ${response.status}`);
  }
}

const ProfileForm = (props) => {
  const {
    handleSubmit,
    submitting,
    onSubmit,
    submitFailed,
    onImageChange,
    imagePreview,
  } = props;
  return (
    <form
      onSubmit={handleSubmit}
      className={`needs-validation ${submitFailed ? "was-validated" : ""}`}
      noValidate
    >
      <div className="card border-primary">
        <h6 className="card-header">
          <i className="bi bi-person-lines-fill" /> Profile Detail
        </h6>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <Field
              name="mobileNumber"
              type="number"
              component={renderFormGroupField}
              placeholder="Mobile no without country code"
              icon={IconPhone}
              validate={[required, maxLengthMobileNo, minLengthMobileNo, digit]}
              required={true}
              max="999999999999999"
              min="9999"
            />
          </li>
          <li className="list-group-item">
            <Field
              name="email"
              type="email"
              component={renderFormGroupField}
              placeholder="Your email"
              icon={IconEnvelop}
              validate={[required, email]}
              required={true}
            />
          </li>
        </ul>
        <div className="card-body">
          <button
          type="submit"
          className="btn btn-primary d-flex"
          disabled={submitting}
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default compose(
  reduxForm({
    form: "profile",
  })
)(ProfileForm);
