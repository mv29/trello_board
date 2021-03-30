import React, { useState, useEffect } from 'react';
import List from '../components/list'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useFormik } from 'formik';
import '../styles/dashboard.css'
import db from '../db';

function Dashboard() {
  const [lists, setLists] = useState([]);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [cardsList, setCardsList] = useState({})

  useEffect(() => {
    (async function getListFromDb() {
      try {
        let list = await db.lists.toArray();
        setLists(list);
      } catch (err) {
//         alert('error occured while fetching data please see console for further investigation');
        console.log(err);
      }
    })();
  }, []);

  useEffect(() => {
    (async function getListFromDb() {
      let initCardList = {};
      try {
        let response = await db.cards.toArray();
        debugger
        response.each((card) => {
          if(initCardList.hasOwnProperty(card.lastId)) {
            initCardList[card.lastId].push(card);
          } else {
            initCardList[card.lastId] = [];
            initCardList[card.lastId].push(card);
          }
        });
        setCardsList(initCardList);
      } catch (err) {
//         alert('error occured while fetching data please see console for further investigation');
        console.log(err);
      }
    })();
  }, []);

  let mv = 10;
  async function addCard(values) {
  debugger
    try {
      let newCard = {
        title: values.title,
        description: values.description,
        listId: values.listId,
        id: mv
      }
      mv++
      // const response = await db.cards.add(newCard);
      // newCard.id = response;
      // setCardsList(cardsList.concat(newCard));
      let newCardList = cardsList;
      if (newCardList.hasOwnProperty(newCard.listId)) {
        newCardList[newCard.listId].push(newCard);
      } else {
        newCardList[newCard.listId] = [];
        newCardList[newCard.listId].push(newCard);
      }
      setCardsList(newCardList);
      handleClose();
    } catch (err) {
//       alert(err); // TypeError: failed to fetch
    console.log(err);
    }
  }

  async function removeCard(event) {
    alert('are you sure');
    try {
      await db.cards.delete(parseInt(event.target.id));
      debugger
      setCardsList(cardsList.filter(card => card.id === event.target.id));
    } catch (err) {
      alert(err); // TypeError: failed to fetch
    }
  }

  async function deleteAllCards(listId) {
    try {
      await db.cards.where('listId').equals(listId).delete();
    } catch (err) {
      alert('error occured while fetching data please see console for further investigation')
      console.log(err); // TypeError: failed to fetch
    }
  }

  async function addList(values) {
    try {
      const response = await db.lists.add({ title: values.title });
      debugger
      setLists(lists.concat({ title: values.title, id: response }));
      handleClose();
    } catch (err) {
      alert(err); // TypeError: failed to fetch
    }
  }

  async function removeList(event) {
    alert('are you sure');
    try {
      await db.lists.delete(parseInt(event.target.id));
      setLists(lists.filter(list => list.id === event.target.id));
      deleteAllCards(parseInt(event.target.id));
    } catch (err) {
      alert(err); // TypeError: failed to fetch
    }
  }

  const formik = useFormik({
    initialValues: {
      title: '',
    },
    onSubmit: values => { addList(values) },
  }
  );

  function cardDragOver(event) {
    event.preventDefault();
  }

  function cardOnDrop(event, newListId) {
    let card = JSON.parse(event.dataTransfer.getData("id"));
    let previousListId = card.listId;
    console.log("cardOnDrop");
    console.log(card);
    card.listId = newListId;
    let newCardList = {};
    debugger
    cardsList.each((key) => {
      if(key === newListId) {
        card.listId = newListId
        newCardList[key] = cardsList[key];
      } else if(key === card.lastId) {
        newCardList[key] = cardsList.filter(cardObj => cardObj.id === previousListId );
      } else {
        newCardList[key] = cardsList[key];
      }
    });
    setCardsList(newCardList);
  }

  return (
    <>
      <header>
        <h1 className="text-center m-2 p-2">
          Trello Board
      </h1>
        <Button variant="outline-primary" className="mx-2 list_create_button" onClick={handleShow}>Create List</Button>
      </header>
      <hr></hr>
      <div>
        <div className="dashboard">
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Create New List</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={formik.handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>List Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    id="title"
                    required
                    onChange={formik.handleChange}
                    value={formik.values.title}
                    placeholder="List Title"
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Submit
             </Button>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
            </Button>
            </Modal.Footer>
          </Modal>
          <div className="row text-center list_container">
            {
              lists.map(list => (
                <div
                  className='col-xs-4 list overflow-auto'
                  onDragOver={cardDragOver}
                  key={list.id}
                  onDrop={(event) => cardOnDrop(event, list.id)}
                >
                  <List title={list.title}
                    id={list.id}
                    removeList={removeList}
                    setCardsList={setCardsList}
                    cardsList={cardsList[list.id] || []}
                    addCard={addCard}
                    removeCard={removeCard}
                  >
                  </List>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;