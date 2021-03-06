// import React from 'react'
import React, { useState, useEffect, Fragment } from 'react';
import MongoDBURI from '../Components/MongoDBURI';
import MongoSchemaIDE from '../Components/MongoSchemaIDE';
import DropDownMenu from '../Components/DropDownMenu';
import PlaygroundButton from '../Components/PlaygroundButton';
// import Tree from '../Components/Tree';
// import TreeChart from '../Components/TreeChart';
import TreeGraph from '../Components/TreeGraph';
import Loader from '../Components/Loader';

const Container = () => {
  const [schemaData, setSchemaData] = useState({});
  const [uriId, setUriId] = useState('');
  const [selectedSchemaData, setSelectedSchemaData] = useState([]);
  const [clicked, setClicked] = useState([]);
  const [graphQLSchema, setGraphQLSchema] = useState({});
  const [loading, setLoading] = useState(false);

  // enter MongoDBURI to receive schemas
  // submit function fetches schemas from backend when Submit button is clicked
  const submit = (e) => {
    e.preventDefault();
    console.log('submit worked');
    setLoading(true);
    fetch('http://localhost:3000/getURI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({val: 'mongodb+srv://judy:coderepforum@coderep-forum-idfny.mongodb.net/Forum?retryWrites=true&w=majority'})
      body: JSON.stringify({
        val: uriId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log('data string from fetch', data)
        setSchemaData(JSON.parse(data));
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  // updating state with the MongoDBRUI from input field
  const getUri = (e) => {
    setUriId(e.target.value);
    console.log(uriId);
  };

  const addCheckmark = (item) => {
    let clickedSchema = item.target.name;
    if (clicked.includes(clickedSchema)) {
      setClicked(
        clicked.filter((tool) => {
          return tool !== clickedSchema;
        })
      );
    } else {
      setClicked([...clicked, clickedSchema]);
    }
  };
  // sendSchema function builds the selectedSchemas object with the schemas that are selected in the DropDownMenu
  // sends the selectedSchemas to the backend for migration
  const sendSchemas = (e) => {
    setSelectedSchemaData([]);
    let selectedSchemas = {};
    for (let i = 0; i < clicked.length; i += 1) {
      selectedSchemas[clicked[i]] = schemaData[clicked[i]];
    }
    console.log('selectedSchemas is ', selectedSchemas);
    setSelectedSchemaData([selectedSchemas]);
    fetch('http://localhost:3000/selectedSchemas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedSchemas, uriId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setGraphQLSchema(data);
      })
      .catch((error) => {
        console.log('Error', error);
      });
    setClicked([]);
  };

  // creating formatted object for d3 graph
  let schemaChart = {};
  if (selectedSchemaData[0]) {
    schemaChart = {
      name: 'Database Schema',
      children: [],
    };
    let i = 0;
    let childArr = [];
    for (let key in selectedSchemaData[0]) {
      console.log(selectedSchemaData[0][key]);
      for (let prop in selectedSchemaData[0][key]) {
        childArr.push({ name: prop });
      }
      console.log(childArr);
      schemaChart.children[i] = {
        name: key,
        children: childArr,
      };
      childArr = [];
      i++;
    }
  }

  return (
    <Fragment>
      {loading ? <Loader /> : null}
      <div style={loading ? { opacity: '.1' } : { opacity: '1' }}>
        <div className="container">
          <img
            className="logo"
            src="https://i.ibb.co/PYBbKLK/Screen-Shot-2021-02-11-at-10-21-02-AM.png"
            alt="QLens-logo"
            border="0"
          />
          <MongoDBURI
            schemaData={schemaData}
            uriData={uriId}
            geturi={getUri}
            submitbtn={submit}
            sendSchemas={sendSchemas}
            addCheckmark={addCheckmark}
          />
          <PlaygroundButton />
        </div>
        <div className="grid-container">
          <DropDownMenu
            schemaData={schemaData}
            uriData={uriId}
            sendSchemas={sendSchemas}
            addCheckmark={addCheckmark}
          />
          {Object.keys(schemaChart).length > 0 ? (
            <TreeGraph schemaChart={schemaChart} />
          ) : null}
          <MongoSchemaIDE
            selectedSchemaData={selectedSchemaData}
            graphQLSchema={graphQLSchema}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default Container;
