import React, { useState } from 'react';
import "./faq.css";
import faqs from "../../assets/faq/faq.json";

export const FaqPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="faqContainer">
      <h1>FAQ</h1>
      <div className="searchBar" style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="searchInput"
        />
      </div>
      {filteredFaqs.length > 0 ? (
        filteredFaqs.map((faq, index) => (
          <details key={index} className="faqItem">
            <summary className="faqQuestion">{faq.question}</summary>
            <p className="faqAnswer">{faq.answer}</p>
          </details>
        ))
      ) : (
        <p>No FAQs match your search criteria.</p>
      )}
    </div>
  );
};
