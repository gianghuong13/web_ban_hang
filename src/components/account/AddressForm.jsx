import React, { useEffect, useState } from "react";
import { CountryDropdown, RegionDropdown, CityDropdown } from 'react-country-region-selector';
import { Field, reduxForm } from "redux-form";
import { ReactComponent as IconGeoAlt } from "bootstrap-icons/icons/geo-alt.svg";
import renderFormGroupField from "../../helpers/renderFormGroupField";
import axios from 'axios';
import {
  required
} from "../../helpers/validation";
let AddressForm = (props) => {
  const {
    handleSubmit,
  } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [country, setCountry] = useState('');
    const [province, setProvince] = useState('');
    useEffect(() => {
      setIsLoading(false);
    }, []);
    const addressSubmit = (values) => {
      // Get the user data
      axios.get('http://localhost:5000/account/user', { withCredentials: true })
        .then(response => {
          if (response.data.valid) {
            const userId = response.data.user_id;
            console.log('User ID:', userId);
            // Send a POST request to add the address
            console.log('Request body:', {
              country: values.country,
              province: values.province,
              city: values.city,
              address: values.address,
              primary: true  // Set this to true if this is the primary address
            });
            axios.post(`http://localhost:5000/account/${userId}/address`, {
              country: values.country,
              province: values.province,
              city: values.city,
              address: values.address,
              primary: true  // Set this to true if this is the primary address
            }, { withCredentials: true })
              .then(response => {
                console.log('Address added successfully');
                window.location.reload();
              })
              .catch(err => {
                console.error('Error adding address:', err);
              });
          }
        })
        .catch(err => {
          console.error('Error getting user data:', err);
        });
    };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <form onSubmit={handleSubmit(addressSubmit)}>
    <div className="card border-primary">
      <h6 className="card-header">
        <i className="bi bi-geo-alt-fill" /> Address Detail
      </h6>
      <ul className="list-group list-group-flush">
        {/* <li className="list-group-item">
          <label>Country</label>
          <CountryDropdown
            value={country}
            onChange={(val) => setCountry(val)}
          />
        </li>
        <li className="list-group-item">
          <label>Province</label>
          <RegionDropdown
            country={country}
            value={province}
            onChange={(val) => setProvince(val)}
          />
        </li> */}
    <li className="list-group-item">
          <label>Country</label>
          <Field
            name="country"
            type="text"
            component={renderFormGroupField}
            placeholder="Country"
            icon={IconGeoAlt}
            validate={[required]}
            required={true}
          />
        </li>
        <li className="list-group-item">
          <label>City</label>
          <Field
            name="city"
            type="text"
            component={renderFormGroupField}
            placeholder="City"
            icon={IconGeoAlt}
            validate={[required]}
            required={true}
          />
        </li>
        <li className="list-group-item">
          <label>Province</label>
          <Field
            name="province"
            type="text"
            component={renderFormGroupField}
            placeholder="Province"
            icon={IconGeoAlt}
            validate={[required]}
            required={true}
          />
        </li>
        <li className="list-group-item">
          <label>Address</label>
          <Field
            name="address"
            type="text"
            component={renderFormGroupField}
            placeholder="Address"
            icon={IconGeoAlt}
            validate={[required]}
            required={true}
          />
        </li>
      </ul>
      <div className="card-footer text-end">
        <button type="submit" className="btn btn-primary">
          <i className="bi bi-check2" /> Submit
        </button>
      </div>
    </div>
  </form>
  );
};

AddressForm = reduxForm({
  form: 'address', // a unique identifier for this form
})(AddressForm);

export default AddressForm;
