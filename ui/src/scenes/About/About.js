import React from 'react';
import { Card, CardBody, Container, Row, Col } from 'reactstrap';

const About = () => (
  <Container fluid>
    <Row>
      <Col lg={{ size: 6, offset: 3 }}>
        <Card>
          <CardBody>
            <h1>About</h1>
            <p>Spring knowledge - get your world organized</p>
          </CardBody>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default About;
