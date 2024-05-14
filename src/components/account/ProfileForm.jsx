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
    const [userId, setUserId] = useState(null);
    const [addresses, setAddresses] = useState([]); // State to hold addresses
    useEffect(() => {
      axios.get('http://localhost:5000/account/user', { withCredentials: true })
        .then(response => {
          setIsLoading(false);
          if (response.data.valid) {
            setIsLoggedIn(true);
            setUserId(response.data.user_id); // Set the userId state
            axios.get(`http://localhost:5000/account/${response.data.user_id}/addresses`, { withCredentials: true }) // Fetch addresses
              .then(response => {
                console.log('Addresses:', response.data);
                setAddresses(response.data);
              })
              .catch(error => {
                console.error(error);
              });
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

  const deleteAddress = (addressId) => {
    axios.delete(`http://localhost:5000/account/address/remove/${addressId}`, { withCredentials: true })
      .then(response => {
        console.log('Address deleted successfully');
        // Remove the deleted address from the addresses state
        setAddresses(addresses.filter(address => address.address_id !== addressId));
      })
      .catch(err => {
        console.error('Error deleting address:', err);
      });
  };

  const makePrimary = (addressId) => {
    axios.put(`http://localhost:5000/account/${userId}/address/${addressId}/primary`, {}, { withCredentials: true })
      .then(response => {
        console.log('Address updated successfully');
        // Update the addresses state to reflect the change
        setAddresses(addresses.map(address => {
          if (address.address_id === addressId) {
            return { ...address, primary: 1 };
          } else if (address.primary === 1) {
            return { ...address, primary: 0 };
          } else {
            return address;
          }
        }));
      })
      .catch(err => {
        console.error('Error updating address:', err);
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
      </form>
      <div className="card border-primary mt-4">
      <h6 className="card-header">
        <i className="bi bi-truck"></i> Shipping Information
      </h6>
      <div className="card-body">
        <div className="row g-3">
          {/* Render addresses with delete and make primary buttons */}
          {addresses.map(address => (
            <div key={address.address_id} className="col-md-12">
              <label>
                {`${address.address}, ${address.province}, ${address.city}, ${address.country}`}
              </label>
              <button onClick={() => deleteAddress(address.address_id)}>
                Delete
              </button>
              <button onClick={() => makePrimary(address.address_id)}>
                Make Primary
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default compose(
  reduxForm({
    form: "profile",
  })
)(ProfileForm);
