const cart = document.querySelector('.cart');
const emptyCart = document.querySelector('.empty-cart');
const CartHeaderQuantity = document.querySelector('.cart-header-quantity');
const itemQuantity = document.querySelectorAll('.item-quantity');
const addToCartBtns = document.querySelectorAll('.add-btn1');
const fullGridContainerHTML = document.querySelector('.grid-container');
const fullCart = document.querySelector('.full-cart');
const modalContainer = document.querySelector('.modal-container');
const confirmBtn = document.querySelector('.confirm-btn');



let productsData = {};  //to store products by id
let carts = [];


document.addEventListener('DOMContentLoaded', () => {
    initApp();
});


const initApp = () => {
    //get data from the json
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            productsData = data.reduce((acc, product) => {
                acc[product.id] = product;
                return acc;
            }, {});
            console.log(productsData);
            addDataToHTML();

            if (localStorage.getItem('cart')) {
                carts = JSON.parse(localStorage.getItem('cart'));
                addToCartHtml();
                reflectCartState();
            };
        })
        .catch(error => console.error('Error fetching data:', error));
};


const addDataToHTML = () => {
    fullGridContainerHTML.innerHTML = '';
    Object.values(productsData).forEach(product => {
        let productElement = document.createElement('div');
        productElement.classList.add('full-grid');
        productElement.dataset.id = product.id;
        productElement.innerHTML = `
                        <div class="image-container">
                            <img src="${product.image.desktop}" alt="">
                        </div>
                        <div class="button-container">
                            <button class="add-btn1 active">
                                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none"
                                    viewBox="0 0 21 20">
                                    <g fill="#C73B0F" clip-path="url(#a)">
                                        <path
                                            d="M6.583 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM15.334 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM3.446 1.752a.625.625 0 0 0-.613-.502h-2.5V2.5h1.988l2.4 11.998a.625.625 0 0 0 .612.502h11.25v-1.25H5.847l-.5-2.5h11.238a.625.625 0 0 0 .61-.49l1.417-6.385h-1.28L16.083 10H5.096l-1.65-8.248Z" />
                                        <path d="M11.584 3.75v-2.5h-1.25v2.5h-2.5V5h2.5v2.5h1.25V5h2.5V3.75h-2.5Z" />
                                    </g>
                                    <defs>
                                        <clipPath id="a">
                                            <path fill="#fff" d="M.333 0h20v20h-20z" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <p>
                                    Add to cart
                                </p>
                            </button>
                            <div class="cart-plus-minus">
                                <span class="access-hidden">Cart quantity</span>
                                <button class="more-less decrement">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill=""
                                        viewBox="0 0 10 2">
                                        <path fill="" d="M0 .375h10v1.25H0V.375Z" />
                                    </svg>
                                </button>
                                <span class="item-quantity">1</span>
                                <button class="more-less increment">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill=""
                                        viewBox="0 0 10 10">
                                        <path fill=""
                                            d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                     <p class="description">
                        ${product.category}
                        <br>
                    <h5 class="tertiary-header">${product.name}</h5 class="tertiary-header">
                    <div class="price">$${product.price.toFixed(2)}</div>
                    </p>
            `;
        toggleAddToCArtButtons();
        fullGridContainerHTML.appendChild(productElement);

        const addBtns = productElement.querySelector('.add-btn1')
        const incrementButton = productElement.querySelector('.increment');
        const decrementButton = productElement.querySelector('.decrement');

        addBtns.addEventListener('click', () => addToCart(product));
        incrementButton.addEventListener('click', () => updateQuantity(product, 1));
        decrementButton.addEventListener('click', () => updateQuantity(product, -1));
    });

};



const updateQuantity = (product, change) => {
    const cartItem = carts.find(item => item.product.id === product.id);
    if (cartItem) {
        cartItem.quantity = Math.max(cartItem.quantity + change, 1);

        // Update the displayed quantity in the grid item
        const productElement = document.querySelector(`.full-grid[data-id="${product.id}"]`);
        if (productElement) {
            const itemQuantityElement = productElement.querySelector('.item-quantity');
            itemQuantityElement.textContent = cartItem.quantity;
        }
        addToCartHtml();
    }
};



//TO ADD THE ITEMS TO CART
const addToCart = (product) => {
    let cartItemIndex = carts.findIndex((item) => item.product.id === product.id);
    if (cartItemIndex > -1) {
        carts[cartItemIndex].quantity += 1;
    } else {
        carts.push({ product, quantity: 1 });
    };

    // Find the corresponding product element in the grid
    const productElement = document.querySelector(`.full-grid[data-id="${product.id}"]`);
    if (productElement) {
        toggleButtonVisibility(productElement, true); // Show "cart plus-minus" controls
    }

    addToCartHtml();
    addToMemory();
};

const addToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(carts));
};




const addToCartHtml = () => {
    const cartContainerHTML = document.querySelector('.cart-container');
    cartContainerHTML.innerHTML = '';
    let totalCartHeaderQuantity = 0;

    carts.forEach(cartItem => {
        totalCartHeaderQuantity += cartItem.quantity;
        const { product, quantity } = cartItem;
        const cartItemElement = document.createElement('article');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
                <div class="cart-quantity">
                    <p class="cart-heading">${product?.name}</p>
                    <div class="quantity-wrapper">
                        <span class="quantity">${quantity + 'x'}</span>
                        <span class="each-item">@$${product?.price.toFixed(2)}</span>
                        <span class="item-total">$${(quantity * product?.price.toFixed(2)).toFixed(2)}</span>
                    </div>
                </div>
                <button class="remove-item" type="button">
                    <span class="access-hidden"></span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                        <path fill="" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z" />
                    </svg>
                </button>
            `;

        const removeItemsButtons = cartItemElement.querySelector('.remove-item');
        removeItemsButtons.addEventListener('click', () => removeItemsFromCart(product.id))
        cartContainerHTML.appendChild(cartItemElement);

    });
    CartHeaderQuantity.textContent = `(${totalCartHeaderQuantity})`;
    updateCartTotal();
    checkCartState();
    addToMemory();
};


const removeItemsFromCart = (productId) => {
    carts = carts.filter(item => item.product.id !== productId);
    addToCartHtml();


    const productElement = document.querySelector(`.full-grid[data-id="${productId}"]`);
    if (productElement) {
        toggleButtonVisibility(productElement, false); // Reset button state for this product
    }
    addToMemory();
};


//confirm order button

confirmBtn.addEventListener('click', () => {
    console.log(confirmBtn);
    modalContainer.style.opacity = 1;
    modalContainer.style.pointerEvents = 'auto';
    updateModal();// Update the modal content with the current cart state
});



// Update the modal content with the current cart state
function updateModal() {
    const modalContentWrapper = modalContainer.querySelector('.modal-content-wrapper');
    modalContentWrapper.innerHTML = '';

    let total = 0;
    carts.forEach(cartModalItems => {
        const { product, quantity } = cartModalItems;
        const itemTotal = quantity * product.price;
        console.log(itemTotal);
        total += itemTotal;
        const itemHTML = `
        <div class="items-wrapper">
                    <div class="item-details">
                        <div class="image-wrapper">
                            <img src="${product.image.thumbnail}">
                        </div>
                        <div class="cart-quantities">
                            <p class="cart-headings">${product.name}</p>
                            <div class="quantity-wrappers">
                                <span class="quantity">${quantity + 'x'}</span>
                                <span class="each-item">@$${product.price.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <span class="total-price">$${itemTotal.toFixed(2)}</span>
                </div>
        `;
        modalContentWrapper.insertAdjacentHTML('beforeend', itemHTML);
    });

    const orderTotalHTML = `
      <div class="order-total">
                    <p>Order total</p>
                   <span class="amount">$${total.toFixed(2)}</span>
                </div>
            </div>
    `;
    modalContentWrapper.insertAdjacentHTML('beforeend', orderTotalHTML);




    const newOrderButton = document.querySelector('.new-order-button');
    newOrderButton.addEventListener('click', startNewOrder);
};



//start new order button function

function startNewOrder() {
    carts = []; // reset carts array
    addToCartHtml(); // Clears the cart HTML
    updateModal(); //clears the modal content

    // to reset the add to cart buutons

    const addToCartButtons = document.querySelectorAll('.add-btn1');
    addToCartButtons.forEach(button => {
        const productElement = button.closest('.full-grid');
        const cartPlusMinus = productElement.querySelector('.cart-plus-minus');
        const itemQuantity = productElement.querySelector('.item-quantity');

        button.style.display = 'flex';
        button.classList.remove('selected');
        button.classList.add('active');

        cartPlusMinus.style.display = 'none';
        itemQuantity.textContent = 1;
    });

    CartHeaderQuantity.textContent = `(0)`; // Reset header quantity to zero

    document.querySelector('.amount').innerText = '$0.00'; // Reset cart total to zero

    modalContainer.style.opacity = 0;
    modalContainer.style.pointerEvents = 'none';

    addToMemory();
}





const toggleButtonVisibility = (productElement, inCart) => {
    const addToCartButton = productElement.querySelector('.add-btn1');
    const cartPlusMinus = productElement.querySelector('.cart-plus-minus');
    const itemQuantity = productElement.querySelector('.item-quantity');

    if (inCart) {
        addToCartButton.style.display = 'none'; // Hide "Add to Cart" button
        cartPlusMinus.style.display = 'flex';   // Show quantity controls
    } else {
        addToCartButton.style.display = 'flex';  // Show "Add to Cart" button
        cartPlusMinus.style.display = 'none';    // Hide quantity controls
        itemQuantity.textContent = 1;            // Reset item quantity to 1
    }
    toggleAddToCArtButtons();
    addToMemory();
};








//TOGGLE THE ADD TO CART BUTTONS
function toggleAddToCArtButtons() {
    const addBtns = document.querySelectorAll('.add-btn1');
    const cartPlusMinus = document.querySelectorAll('.cart-plus-minus');
    addBtns.forEach((btn, index) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            event.target.classList.toggle('active');
            if (cartPlusMinus[index]) {
                cartPlusMinus[index].classList.add('active');
            }
        });
    });
};



//to calculate the cart total
const updateCartTotal = () => {
    const total = carts.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
    document.querySelector('.amount').innerText = '$' + total.toFixed(2);
};


//To check cart state
const checkCartState = () => {
    fullCart.style.display = carts.length > 0 ? 'block' : 'none';
    emptyCart.style.display = carts.length === 0 ? 'block' : 'none';
};

const reflectCartState = () => {
    carts.forEach(cartItem => {
        const productElement = document.querySelector(`.full-grid[data-id="${cartItem.product.id}"]`);
        if (productElement) {
            toggleButtonVisibility(productElement, true); // Show quantity controls
            const itemQuantityElement = productElement.querySelector('.item-quantity');
            itemQuantityElement.textContent = cartItem.quantity; // Set the correct quantity
        };
    });
};



const reflectCartState = () => {
    carts.forEach(cartItem => {
        const productElement = document.querySelector(`.full-grid[data-id="${cartItem.product.id}"]`);
        if (productElement) {
            toggleButtonVisibility(productElement, true); // Show quantity controls
            const itemQuantityElement = productElement.querySelector('.item-quantity');
            itemQuantityElement.textContent = cartItem.quantity; // Set the correct quantity
        };
    });
};



