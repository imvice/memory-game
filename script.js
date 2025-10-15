const categories = ['dogs', 'cats', 'harry-potter'];

const info = document.querySelector('.info');
const info2 = document.querySelector('.info2');
const cards = document.querySelectorAll('.memory-card');
const btnDiv = document.querySelector('.btnDiv');

const TOTAL_PAIRS = 6;

let firstCard,
	secondCard,
	matchedPairs = 0,
	lockBoard = true,
	isCardFlipped = false;

const doDogApi = async () => {
	try {
		const url = 'https://dog.ceo/api/breeds/image/random/6';
		const response = await fetch(url);
		const data = await response.json();
		const imgArr = data.message;

		// making pairs from the 6 images and shuffle them
		const shuffledArr = shuffleCards(imgArr);

		assignImagesToCards(shuffledArr, 'Dog');
	} catch (err) {
		console.error('Dog API failed:', err);
	}
};

const doCatApi = async () => {
	try {
		const url = 'https://api.thecatapi.com/v1/images/search?limit=10';
		const response = await fetch(url);
		const data = await response.json();

		// maps over the first 6 cat objects and returns a new array with their image url
		const imgArr = data.slice(0, 6).map(obj => obj.url);
		const shuffledArr = shuffleCards(imgArr);

		assignImagesToCards(shuffledArr, 'Cat');
	} catch (err) {
		console.error('Cat API failed:', err);
	}
};

const doHarryPotterApi = async () => {
	try {
		const url = 'https://hp-api.onrender.com/api/characters';
		const response = await fetch(url);
		const data = await response.json();

		const imgArr = data.slice(0, 6).map(obj => obj.image);
		const shuffledArr = shuffleCards(imgArr);

		assignImagesToCards(shuffledArr, 'Harry Potter');
	} catch (err) {
		console.error('Harry Potter API failed:', err);
	}
};

const getRandomCategory = () => {
	const idx = Math.floor(Math.random() * categories.length);
	return categories[idx];
};

const loadCategory = async category => {
	switch (category) {
		case 'dogs':
			info2.textContent = `Chosen category: Dogs`;
			await doDogApi();
			break;
		case 'cats':
			info2.textContent = `Chosen category: Cats`;
			await doCatApi();
			break;
		case 'harry-potter':
			info2.textContent = `Chosen category: Harry Potter`;
			await doHarryPotterApi();
			break;
		default:
			console.warn(`Unknown category: ${category}`);
	}
	lockBoard = false;
};

const assignImagesToCards = (arr, type = 'Card') => {
	cards.forEach((card, i) => {
		const frontImg = card.querySelector('.front-face');
		frontImg.src = arr[i];
		frontImg.alt = `${type}${++i}`;
	});
};

const flipCard = e => {
	const card = e.currentTarget;
	if (lockBoard) return;
	if (card === firstCard) return;

	card.classList.add('flip');

	if (!isCardFlipped) {
		isCardFlipped = true;
		firstCard = card;
		return;
	}

	secondCard = card;
	checkForMatch();
};

const checkForMatch = () => {
	const firstImg = firstCard.querySelector('.front-face');
	const secondImg = secondCard.querySelector('.front-face');
	const isMatch = firstImg.src === secondImg.src;

	isMatch ? disableCards() : unflipCards();
};

const disableCards = () => {
	firstCard.removeEventListener('click', flipCard);
	secondCard.removeEventListener('click', flipCard);

	matchedPairs++;
	if (matchedPairs === TOTAL_PAIRS) announceWin();

	resetBoard();
};

const unflipCards = () => {
	lockBoard = true;

	setTimeout(() => {
		if (firstCard) firstCard.classList.remove('flip');
		if (secondCard) secondCard.classList.remove('flip');

		resetBoard();
	}, 1500);
};

const resetBoard = () => {
	isCardFlipped = false;
	lockBoard = false;
	firstCard = null;
	secondCard = null;
};

const announceWin = () => {
	setTimeout(() => {
		info.textContent = `You Win! 🏆`;
		info.style.color = 'var(--success)';
		info2.textContent = ` Press any button to play again.`;
		info2.style.color = 'var(--info)';
	}, 500);
};

// spreads an array twice to get 6 pairs of 2 cards each and shuffles them
const shuffleCards = arr => {
	return [...arr, ...arr].sort(() => Math.random() - 0.5);
};

// clear board visually and re-add event listener to flipped cards
const resetCardsState = () => {
	cards.forEach(card => {
		card.classList.remove('flip');
		card.addEventListener('click', flipCard);
	});
};

const resetInfo = () => {
	info.textContent = 'Memory Card Game!';
	info.style.color = 'var(--info)';
	info2.textContent = 'Choose a category:';
	info2.style.color = 'var(--text-muted)';
};

// loads a random card category on page load / refresh
// window.addEventListener('load', () => {
// 	loadCategory(getRandomCategory());
// });

cards.forEach(card => card.addEventListener('click', flipCard));

btnDiv.addEventListener('click', e => {
	matchedPairs = 0;
	resetBoard();
	resetCardsState();
	resetInfo();

	if (e.target.classList.contains('dogs')) loadCategory('dogs');
	if (e.target.classList.contains('cats')) loadCategory('cats');
	if (e.target.classList.contains('harry-potter')) loadCategory('harry-potter');
	if (e.target.classList.contains('random')) loadCategory(getRandomCategory());
});
