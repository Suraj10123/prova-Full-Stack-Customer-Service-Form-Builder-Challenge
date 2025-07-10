import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import DynamicForm from '../components/DynamicForm';

export default function FormFill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:4000/api/forms/${id}`).then(r => setSchema(r.data));
  }, [id]);

  const handleSubmit = values => {
    axios.post(`http://localhost:4000/api/forms/${id}/submissions`, { values })
      .then(() => navigate('/'));
  };

  return schema ? <DynamicForm schema={schema} onSubmit={handleSubmit} /> : <p>Loading…</p>;
}
