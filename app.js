// variables
const cartBtn = document.querySelector(".cart-btn"); // Selecting the cart button element
const closeCartBtn = document.querySelector(".close-cart"); // Selecting the close cart button element
const clearCartBtn = document.querySelector(".clear-cart"); // Selecting the clear cart button element
const cartDOM = document.querySelector(".cart"); // Selecting the cart element
const cartOverlay = document.querySelector(".cart-overlay"); // Selecting the cart overlay element
const cartItems = document.querySelector(".cart-items"); // Selecting the cart items element
const cartTotal = document.querySelector(".cart-total"); // Selecting the cart total element
const cartContent = document.querySelector(".cart-content"); // Selecting the cart content element
const productsDOM = document.querySelector(".products-center"); // Selecting the products DOM element

// cart
let cart = []; // Initializing an empty array for the cart items

// buttons
let buttonsDOM = []; // Initializing an empty array for the buttons

// getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json"); // Fetching the products from a JSON file
      let data = await result.json(); // Parsing the result into JSON format

      let products = data.items; // Getting the product items from the JSON data
      products = products.map(item => { // Mapping through each product item
        const { title, price } = item.fields; // Destructuring the title and price from the fields object
        const { id } = item.sys; // Destructuring the id from the sys object
        const image = item.fields.image.fields.file.url; // Getting the image URL from the fields object
        return { title, price, id, image }; // Returning an object with the required product details
      });
      return products; // Returning the array of products
    } catch (error) {
      console.log(error); // Logging any errors that occur during the fetching and parsing process
    }
  }
}

// display products
class UI {
    displayProducts(products) {
      let result = "";
      products.forEach(product => {
        result += `<!-- single product -->
        <article class="product">
          <div class="img-container">
            <img src=${product.image} alt="product" class="product-img" />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>${product.price}</h4>
        </article>
        <!-- end of single product -->
        `;
      });
      productsDOM.innerHTML = result; // Displaying the generated HTML for all products in the productsDOM element
    }
  
    getBagButtons() {
      const buttons = [...document.querySelectorAll(".bag-btn")];
      buttonsDOM = buttons; // Saving the reference to the bag buttons in the buttonsDOM variable
      buttons.forEach(button => {
        let id = button.dataset.id;
        let inCart = cart.find(item => item.id === id);
        if (inCart) {
          button.innerText = "In Cart"; // Changing the button text to "In Cart" if the item is already in the cart
          button.disabled = true; // Disabling the button if the item is already in the cart
        }
        button.addEventListener("click", event => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          // get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 }; // Creating a cart item object with the product details and initial quantity
          // add product to cart
          cart = [...cart, cartItem]; // Adding the cart item to the cart array
          // save cart in local storage
          Storage.saveCart(cart); // Saving the cart in the local storage
          // set cart values
          this.setCartValues(cart); // Updating the cart values (total price and total items)
          // display cart item
          this.addCartItem(cartItem); // Displaying the cart item in the cart UI
          // show the cart
          this.showCart(); // Showing the cart overlay
        });
      });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
          tempTotal += item.price * item.amount; // Calculating the total price for each item in the cart
          itemsTotal += item.amount; // Counting the total number of items in the cart
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2)); // Displaying the total price in the cart
        cartItems.innerText = itemsTotal; // Displaying the total number of items in the cart
      }
    
      addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
          <img src=${item.image} alt="product" />
          <div>
            <h4>${item.title}</h4>
            <h5>${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Remove</span>
            </div>
          <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>`;
        cartContent.appendChild(div); // Adding the cart item to the cart content element
      }
      
      showCart() {
        cartOverlay.classList.add("transparentBcg"); // Adding the transparent background class to the cart overlay
        cartDOM.classList.add("showCart"); // Adding the show cart class to the cart element
      }
      
      setupAPP() {
        cart = Storage.getCart(); // Retrieving the cart from local storage
        this.setCartValues(cart); // Setting the initial cart values
        this.populateCart(cart); // Populating the cart UI with existing cart items
        cartBtn.addEventListener("click", this.showCart); // Adding click event listener to the cart button
        closeCartBtn.addEventListener("click", this.hideCart); // Adding click event listener to the close cart button
      }
      
      populateCart(cart) {
        cart.forEach(item => this.addCartItem(item)); // Adding each cart item to the cart UI
      }
      
      hideCart() {
        cartOverlay.classList.remove("transparentBcg"); // Removing the transparent background class from the cart overlay
        cartDOM.classList.remove("showCart"); // Removing the show cart class from the cart element
      }
      
      CartLogic() {
        // clear cart button
        clearCartBtn.addEventListener("click", () => {
          this.clearCart(); // Clearing the cart when the clear cart button is clicked
        });
      
        // cart functionality
        cartContent.addEventListener("click", event => {
          if (event.target.classList.contains("remove-item")) {
            let removeItem = event.target;
            let id = removeItem.dataset.id;
            cartContent.removeChild(removeItem.parentElement.parentElement);
            this.removeItem(id);
          } else if (event.target.classList.contains("fa-chevron-up")) {
            let addAmount = event.target;
            let id = addAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount + 1; // Increasing the quantity of the item
            Storage.saveCart(cart); // Saving the updated cart in local storage
            this.setCartValues(cart); // Updating the cart values
            addAmount.nextElementSibling.innerText = tempItem.amount; // Updating the displayed item quantity
          } else if (event.target.classList.contains("fa-chevron-down")) {
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount - 1; // Decreasing the quantity of the item
            if (tempItem.amount > 0) {
              Storage.saveCart(cart); // Saving the updated cart in local storage
              this.setCartValues(cart); // Updating the cart values
              lowerAmount.previousElementSibling.innerText = tempItem.amount; // Updating the displayed item quantity
            } else {
              cartContent.removeChild(lowerAmount.parentElement.parentElement); // Removing the cart item from the UI
              this.removeItem(id); // Removing the cart item from the cart array
            }
          }
        });
      }

  // clear the cart
clearCart() {
    let cartItems = cart.map(item => item.id); // Retrieve all cart item IDs
    cartItems.forEach(id => this.removeItem(id)); // Remove each cart item using its ID
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]); // Remove all cart item elements from the UI
    }
    this.hideCart(); // Hide the cart
  }
  
  // remove a single item from the cart
  removeItem(id) {
    cart = cart.filter(item => item.id !== id); // Filter out the item with the specified ID from the cart
    this.setCartValues(cart); // Update the cart values
    Storage.saveCart(cart); // Save the updated cart in local storage
    let button = this.getSingleButton(id); // Get the button element for the removed item
    button.disabled = false; // Enable the button
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`; // Reset the button text
  }
  
  // get a single button element by ID
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id); // Find the button element with the specified ID
  }
  }
  // local storage operations
  class Storage {
    static saveProducts(products) {
      localStorage.setItem("products", JSON.stringify(products)); // Save the products in local storage
    }
  
    static getProduct(id) {
      let products = JSON.parse(localStorage.getItem("products")); // Retrieve the products from local storage
      return products.find(product => product.id === id); // Find the product with the specified ID
    }
  
    static saveCart(cart) {
      localStorage.setItem("cart", JSON.stringify(cart)); // Save the cart in local storage
    }
  
    static getCart() {
      return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []; // Retrieve the cart from local storage
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
  
    // setup app
    ui.setupAPP(); // Set up the app by initializing the cart and setting up event listeners
    // get all products
    products.getProducts().then(products => {
      ui.displayProducts(products); // Display the products in the UI
      Storage.saveProducts(products); // Save the products in local storage
    }).then(() => {
      ui.getBagButtons(); // Set up event listeners for the add to cart buttons
      ui.CartLogic(); // Set up cart functionality (e.g., remove item, change item quantity)
    });
  });
  