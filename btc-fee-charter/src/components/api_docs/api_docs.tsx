import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import apiDocs from "../../assets/api_spec/api_spec.json"
//import './theme-flattop.css';
import "./swagger_custom_styles.css"

const ApiDocs = () => {
  return (
    <div style={{height: '100vh' }}>
      <SwaggerUI spec={apiDocs} />
    </div>
  );
};

export default ApiDocs;
