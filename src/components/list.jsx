import React, {useState, useEffect} from 'react';
import ListCard from './listCard'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useFormik } from 'formik';
import db from '../db';

function List({title, removeList, id, cardsList, addCard, removeCard}) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    

    async function cardDragStart(event, card) {
        console.log("dragstart:", id);
        card = JSON.stringify(card);
        event.dataTransfer.setData("id", card);
        console.log(cardsList)
    }

    const formik = useFormik({
        initialValues: {
          title: '',
          description: '',
          listId: id,
        },
        onSubmit: values => {addCard(values)},}
    );

    return (
    <div>
        <h5 className="text-wrap">
            {title}
            <Button variant="danger" id={`${id}`} onClick={removeList} size="sm" className="list_delete_button">
                X
            </Button>
        </h5>
        <hr></hr>
        <div>
            {cardsList.map(card => (
            <div className="list_card" draggable="true" key={card.title} onDragStart={(event) => cardDragStart(event,card)}>
                <ListCard id={card.id} description={card.description} title={card.title} removeCard={removeCard}></ListCard>
            </div>
            ))}
        </div>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
             <Modal.Title>Create New List</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={formik.handleSubmit}>
                <Form.Group controlId="cardTitleInput">
                    <Form.Label>List Title</Form.Label>
                    <Form.Control 
                    type="text" 
                    name="title" 
                    id="title" 
                    required 
                    onChange={formik.handleChange}
                    value={formik.values.title}
                    placeholder="card title" 
                    />
                </Form.Group>
                <Form.Group controlId="cardDescInput">
                    <Form.Label>Card Description</Form.Label>
                    <Form.Control 
                    type="text" 
                    name="description" 
                    id="description" 
                    required 
                    onChange={formik.handleChange}
                    value={formik.values.description}
                    placeholder="card description" 
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
        <Button variant="outline-primary" className="mx-2 mt-5" onClick={handleShow}>Add Card</Button>
    </div>
    )
}

export default List;