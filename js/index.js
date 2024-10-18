document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('books-list');
    const genreFilter = document.getElementById('genre-filter');
    const searchInput = document.getElementById('search');
    const paginationControls = document.getElementById('pagination-controls');
    const loader = document.getElementById('loader');  // Select the loader
    let allBooks = [];
    let currentPage = 1;
    const booksPerPage = 6;

    // Show the loader when fetching starts
    function showLoader() {
        loader.style.display = 'block';
    }

    // Hide the loader when fetching is done
    function hideLoader() {
        loader.style.display = 'none';
    }

    // Fetch data from the Gutendex API
    function fetchBooks() {
        showLoader();  // Show loader
        fetch('https://gutendex.com/books')
            .then(response => response.json())
            .then(data => {
                allBooks = data.results;
                filterAndDisplayBooks();
                hideLoader();  // Hide loader when books are displayed
            })
            .catch(error => {
                console.error('Error fetching book data:', error);
                container.innerHTML = '<p>Error loading books. Please try again later.</p>';
                hideLoader();  // Hide loader in case of an error
            });
    }

    // Event listeners for filters and search
    genreFilter.addEventListener('change', function() {
        currentPage = 1;
        filterAndDisplayBooks();
    });

    searchInput.addEventListener('input', function() {
        currentPage = 1;
        filterAndDisplayBooks();
    });

    function filterAndDisplayBooks() {
        const selectedGenre = genreFilter.value.toLowerCase();
        const searchQuery = searchInput.value.toLowerCase();

        const filteredBooks = allBooks.filter(book => {
            const genres = book.subjects || [];
            const titleMatch = book.title.toLowerCase().includes(searchQuery);
            const genreMatch = selectedGenre === "" || genres.some(subject => subject.toLowerCase().includes(selectedGenre));
            return titleMatch && genreMatch;
        });

        const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
        const start = (currentPage - 1) * booksPerPage;
        const end = start + booksPerPage;
        const booksToDisplay = filteredBooks.slice(start, end);

        displayBooks(booksToDisplay);
        setupPagination(totalPages);
    }

    function displayBooks(books) {
        container.innerHTML = ''; 
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('col-md-4', 'product-card');

            const imageUrl = book.formats['image/jpeg'] || 'default-book-cover.jpg';  
            const authorName = book.authors && book.authors.length > 0 ? book.authors[0].name : 'Unknown Author';
            const genres = book.subjects && book.subjects.length > 0 ? book.subjects.join(', ') : 'No genres available';
            const bookID = book.id ? book.id : 'ID not available';

            // Determine if the book is in the wishlist
            const isWishlisted = wishlist.includes(book.id);

            bookElement.innerHTML = `
                <div class="product-tumb">
                    <img src="${imageUrl}" alt="${book.title}" class="img-fluid">
                </div>
                <div class="product-details">
                    <h5 class="book-title">${book.title}</h5>
                    <div class="book-author">Author: ${authorName}</div>
                    <div class="book-id">ID: ${bookID}</div>
                    <div class="book-genre">Genre: ${genres}</div>
                    <div class="wishlist-icon" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                      <i class="fa ${isWishlisted ? ' fa-solid fa-heart' : ' fa-regular fa-heart'}" style="cursor: pointer;" data-book-id="${book.id}"></i>
                    </div>
                </div>
            `;

            // Add event listener to the wishlist icon
            const wishlistIcon = bookElement.querySelector('.wishlist-icon i');
            wishlistIcon.addEventListener('click', function() {
                toggleWishlist(book.id);
                filterAndDisplayBooks(); 
            });

            container.appendChild(bookElement);
        });
    }

    function toggleWishlist(bookId, iconElement) {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        
        if (wishlist.includes(bookId)) {
            wishlist = wishlist.filter(id => id !== bookId);
            iconElement.classList.remove('fa-solid');
            iconElement.classList.add('fa-regular');
            iconElement.setAttribute('title', 'Add to Wishlist');
        } else {
            wishlist.push(bookId);
            iconElement.classList.remove('fa-regular');
            iconElement.classList.add('fa-solid');
            iconElement.setAttribute('title', 'Remove from Wishlist');
        }
    
        // Update the local storage with the new wishlist
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    
    function setupPagination(totalPages) {
        paginationControls.innerHTML = ''; 

        const ul = document.createElement('ul');
        ul.classList.add('pagination', 'justify-content-center');  

        if (currentPage > 1) {
            const prevLi = document.createElement('li');
            prevLi.classList.add('page-item');
            const prevButton = document.createElement('button');
            prevButton.innerText = 'Previous';
            prevButton.classList.add('page-link');
            prevButton.addEventListener('click', function() {
                currentPage--;
                filterAndDisplayBooks();
            });
            prevLi.appendChild(prevButton);
            ul.appendChild(prevLi);
        }

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item');
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.classList.add('page-link');
            if (i === currentPage) {
                li.classList.add('active');
            }
            pageButton.addEventListener('click', function() {
                currentPage = i;
                filterAndDisplayBooks();
            });
            li.appendChild(pageButton);
            ul.appendChild(li);
        }

        if (currentPage < totalPages) {
            const nextLi = document.createElement('li');
            nextLi.classList.add('page-item');
            const nextButton = document.createElement('button');
            nextButton.innerText = 'Next';
            nextButton.classList.add('page-link');
            nextButton.addEventListener('click', function() {
                currentPage++;
                filterAndDisplayBooks();
            });
            nextLi.appendChild(nextButton);
            ul.appendChild(nextLi);
        }

        paginationControls.appendChild(ul);
    }

    // Fetch books on page load
    fetchBooks();
});
