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
        console.log(err);
      }
    })();
  }, []);

  useEffect(() => {
    (async function getListFromDb() {
      let initCardList = {};
      try {
        let response = await db.cards.toArray();
        for(let card in response) {
          let listId = response[card].listId.toString();
          if(initCardList.hasOwnProperty(listId)) {
            initCardList[listId].push(response[card]);
          } else {
            initCardList[listId] = [];
            initCardList[listId].push(response[card]);
          }
        }
        setCardsList(initCardList);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  function updateCardsList(newCardList, newCard, listId, insertOnfront = false) {
    if (newCardList.hasOwnProperty(newCard.listId)) {
      insertOnfront ? newCardList[listId].unshift(newCard) : newCardList[listId].push(newCard);;
    } else {
      newCardList[listId] = [];
      newCardList[listId].push(newCard);
    }
  }

  async function addCard(values) {
    try {
      let newCard = {
        title: values.title,
        description: values.description,
        listId: values.listId,
      }
      const response = await db.cards.add(newCard);
      newCard.id = response; 
      let newCardList = {...cardsList};
      updateCardsList(newCardList,newCard,values.listId);
      setCardsList(newCardList);
    } catch (err) {
    console.log(err);
    }
  }

  async function removeCard(event) {
    alert('Are you sure');
    try {
      let [cardId, listId] =  event.target.id.split('#');
      cardId = parseInt(cardId);
      listId = parseInt(listId);
      await db.cards.delete(cardId);
      let newCardList = {...cardsList};
      newCardList[listId] = newCardList[listId].filter((card) => card.id !== cardId)
      setCardsList(newCardList);
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteAllCards(listId) {
    try {
      await db.cards.where('listId').equals(listId).delete();
    } catch (err) {
      console.log(err);
    }
  }

  async function addList(values) {
    try {
      const response = await db.lists.add({ title: values.title });
      setLists(lists.concat({ title: values.title, id: response }));
      handleClose();
    } catch (err) {
      console.log(err);
    }
  }

  async function removeList(event) {
    alert('Are you sure.It will delete all the cards present in this list');
    try {
      await db.lists.delete(parseInt(event.target.id));
      let newList = lists.filter(list => list.id !== parseInt(event.target.id));
      setLists(newList);
      let newCardList = {...cardsList};
      delete(newCardList[event.target.id]);
      setCardsList(newCardList);
      deleteAllCards(parseInt(event.target.id));
    } catch (err) {
      console.log(err);
    }
  }

  function cardDragOver(event) {
    event.preventDefault();
  }

  async function cardOnDrop(event, newListId) {
    try {
      let card = JSON.parse(event.dataTransfer.getData("id"));
      let previousListId = card.listId;
      card.listId = newListId;
      await db.cards.update(card.id, {listId: newListId})
      let newCardList = {...cardsList};
      newCardList[previousListId] = newCardList[previousListId].filter((cardobj) => cardobj.id !== card.id)
      updateCardsList(newCardList,card,newListId,true);
      setCardsList(newCardList);
    } catch(err) {
      console.log(err);
    }
  }

  const formik = useFormik({
    initialValues: {
      title: '',
    },
    onSubmit: values => { addList(values) },
  }
  );

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
          <div className="d-flex text-center align-items-start list_container">
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