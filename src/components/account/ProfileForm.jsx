import React, { useEffect, useState } from "react";
import { Field, reduxForm } from "redux-form";
import { compose } from "redux";
import renderFormGroupField from "../../helpers/renderFormGroupField";
import renderFormFileInput from "../../helpers/renderFormFileInput";
import axios from 'axios';
import {
  required,
  maxLengthMobileNo,
  minLengthMobileNo,
  digit,
  name,
  email,
} from "../../helpers/validation";
import { ReactComponent as IconPhone } from "bootstrap-icons/icons/phone.svg";
import { ReactComponent as IconEnvelop } from "bootstrap-icons/icons/envelope.svg";


const ProfileForm = (props) => {
  const {
    handleSubmit,
    submitting,
    submitFailed,
    onImageChange,
    imagePreview,
  } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [country, setCountry] = useState('');
    const [province, setProvince] = useState('');
    useEffect(() => {
      axios.get('http://localhost:5000/account/user', { withCredentials: true })
        .then(response => {
          setIsLoading(false);
          if (response.data.valid) {
            setIsLoggedIn(true);
          } else {
            window.location.href = '/account/signin';
          }
        })
        .catch(err => {
          console.error('Error checking login status:', err);
          window.location.href = '/account/signin';
        });
    }, []);

  const onSubmit = (values) => {
    axios.put('http://localhost:5000/account/user', values, { withCredentials: true })
      .then(response => {
        console.log('User updated successfully');
        window.location.reload();
      })
      .catch(err => {
        console.error('Error updating user:', err);
      });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
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
      </form> {/* Closing the first form here */}
    </>
  );
  
};

export default compose(
  reduxForm({
    form: "profile",
  })
)(ProfileForm);
