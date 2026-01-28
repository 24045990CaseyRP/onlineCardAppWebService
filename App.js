import React, { useState, useEffect } from 'react';
import { FlatList, StatusBar, Text, TextInput, View } from 'react-native';

//Create a new variable named originalData
let originalData = [];

const App = () => {
  const [mydata, setMyData] = useState([]);
  //Add fetch() - Exercise 1A
  useEffect(() => {
    // const myurl = "https://onlinecardappwebservice-tmj4.onrender.com/allcards"
    const myurl = "http://localhost:8080/allcards"
    fetch(myurl)
      .then((response) => {
        return response.json();
      })
      .then((myJson) => {
        setMyData(myJson);
        originalData = myJson;
      })
  }, []);

  const FilterData = (text) => {
    if (text != '') {
      let myFilteredData = originalData.filter((item) =>
        item.card_name.includes(text));
      setMyData(myFilteredData);
    }
    else {
      setMyData(originalData);
    }
  }
  const renderItem = ({ item, index }) => {
    return (
      <View>
        <Text style={{ borderWidth: 1 }}>{item.card_name}</Text>
      </View>
    );
  };

  return (
    <View>
      <StatusBar />
      <Text>Search:</Text>
      <TextInput style={{ borderWidth: 1 }} onChangeText={(text) => { FilterData(text) }} />
      <FlatList data={mydata} renderItem={renderItem} />
    </View>
  );
}

export default App;
