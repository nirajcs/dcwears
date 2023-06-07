document.addEventListener('DOMContentLoaded', () => {
  const cardDataArray = Array.from(document.getElementsByClassName('cardDataClass'));

  cardDataArray.map(cardData => {
    console.log(cardData.querySelector('.totalPriceClass'));
    const quantityInput = cardData.querySelector('.quantityInput');
    const originalPrice = cardData.querySelector('.originalPriceClass');
    const totalPriceEl = cardData.querySelector('.totalPriceClass');
    console.log(totalPriceEl);
    quantityInput.addEventListener('change', (e) => {
      const totalPrice = quantityInput.value * originalPrice.value;
      totalPriceEl.innerText = totalPrice.toString();
    })
  })
});