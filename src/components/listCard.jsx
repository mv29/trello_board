import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

function ListCard({id, listId,  title, description,removeCard}) {
    
    return (
        <>
        <Card id={id}>
            <Card.Header>
                {title}
                <Button variant="danger" id={`${id}#${listId}`} onClick={removeCard} size="sm" className="list_delete_button">
                    X
                </Button>
            </Card.Header>
            <Card.Body>
                <Card.Text>{description}</Card.Text>
            </Card.Body>
        </Card>
        </>
    )
}

export default ListCard;