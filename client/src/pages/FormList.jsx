import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function FormList() {
  const [forms, setForms] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:4000/api/forms').then(r => setForms(r.data));
  }, []);

  return (
    <div>
      {/* Welcome message */}
      <h1>Welcome to Dogmas Toys Customer Support! Where it's Christmas for Dogs every day!</h1>
      <p>How can we help you and your dog's Santa Paws today?</p>

      {/* Available forms list */}
      <h2>Available Forms</h2>
      <ul>
        {forms.map(f => (
          <li key={f.id}>
            <Link to={`/forms/${f.id}`}>{f.title}</Link> |{' '}
            <Link to={`/forms/${f.id}/submissions`}>Submissions</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
