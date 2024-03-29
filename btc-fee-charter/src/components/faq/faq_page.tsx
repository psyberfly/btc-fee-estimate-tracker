import React, { useState } from 'react';
import "./faq.css";
import faqs from "../../assets/faq/faq.json"; // Ensure the path is correct
export const FaqPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createMarkup = (htmlContent) => {
    return {__html: htmlContent.replace(/\n/g, '<br />')};
  };

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
          // Check if the item is the first in the filtered list to decide whether to open it
          <details key={index} className="faqItem" open={index === 0}>
            <summary className="faqQuestion">{faq.question}</summary>
            {/* Render the answer with line breaks as HTML */}
            <p className="faqAnswer" dangerouslySetInnerHTML={createMarkup(faq.answer)}></p>
          </details>
        ))
      ) : (
        <p>No FAQs match your search criteria.</p>
      )}
    </div>
  );
};
