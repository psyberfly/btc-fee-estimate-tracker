import React, { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import apiDocs from "../../assets/api_spec/api_spec.json"
//import './theme-flattop.css';
import "./swagger_ui_custom_styles.css"
import CircularProgressIndicator from '../loader/loader';

const ApiDocs = () => {

  const [apiSpec, setApiSpec] = useState(null);

  useEffect(() => {
    const apiUrl = (import.meta as any).env.VITE_FEE_WATCHER_PUBLIC_API_URL;
    const modifiedSpec = replaceUrlInSpec(apiDocs, apiUrl);
    setApiSpec(modifiedSpec);
  }, []);

  return apiSpec ?
    <div style={{ height: '100vh' }}>
      <SwaggerUI spec={apiSpec} />
    </div>
    : <div> <CircularProgressIndicator />
    </div>;
};

function replaceUrlInSpec(spec, newUrl) {
  const stringifiedSpec = JSON.stringify(spec);
  const updatedSpec = stringifiedSpec.replace(/http:\/\/myserviceurl\/api\/v1/g, newUrl);
  return JSON.parse(updatedSpec);
}


export default ApiDocs;
