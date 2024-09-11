class Colors {
	#app;
	#root;

	#colorsDataList = [];
	#colorsMap      = {};


	constructor ({app, colorsDataList}) {
		this.#app            = app;
		this.#colorsDataList = JSON.parse(JSON.stringify(colorsDataList));

		let userData = this._getUserData();

		for (let e of this.#colorsDataList) {
			e.isFavorite = !!userData.favoritesMap[e.id];
			this.#colorsMap[e.avgColor] = new Color(e.avgColor);
		}

		this._render()
	}



	_initEvents () {
		this.#root.addEventListener(
			'click',
			e => {
				let closestPart = (code) => {
					return e.target.closest(`[data-jsc-part="${code}"]`);
				}

				let parent;

				if (parent = closestPart('header')) {
					this._headerClick(parent.dataset.code);
				} else if (e.target.dataset.jscPart == 'colorFavorite') {
					let row = e.target.closest('[data-jsc-part="colorRow"]');
					this._favoriteClick(row.dataset.index);
				} else if (parent = closestPart('avgColorCell')) {
					console.log(e.target);
					console.log(parent);
					let mainColor = this.#colorsMap[parent.dataset.rgb];
					this._colorClick(mainColor);
				}
			}
		);
	}



	_headerClick (code) {
		if (code == 'popularity') {
			this._sortByPopularity()
		} else if (code == 'isFavorite') {
			this._sortByFavorite()
		} else {
			this._sortByName()
		}

		this._render();
	}



	_favoriteClick (index) {
		let colorData = this.#colorsDataList[index];

		colorData.isFavorite = !colorData.isFavorite;

		let userData = this._getUserData();

		if (colorData.isFavorite) {
			userData.favoritesMap[colorData.id] = true;
		} else {
			delete userData.favoritesMap[colorData.id];
		}

		this._setUserData(userData);

		this._renderFavorite(index);
	}



	_colorClick (mainColor) {
		this.#colorsDataList.sort((a, b) => {
			a             = this.#colorsMap[a.avgColor];
			b             = this.#colorsMap[b.avgColor];
			let distanceA = mainColor.distance(a, 'oklab');
			let distanceB = mainColor.distance(b, 'oklab');
			return distanceA - distanceB;
		});

		this._render();
		scrollTo(0, 0);
	}



	_render () {
		let html = `
			<table data-jsc="Colors">
				<tr>
					<th class="popularity-column clickable" data-jsc-part="header" data-code="popularity">
						<span class="lg">Popularity</span>
						<span class="md">Pop</span>
						<span class="sm">#</span>
					</th>
					<th class="clickable" data-jsc-part="header" data-code="name">Name</th>
					<th class="favorite-column favorite-header clickable" data-jsc-part="header" data-code="isFavorite">Fav</th>
					<th class="color-column">Color</th>
				</tr>
		`;

		for (let [index, e] of this.#colorsDataList.entries()) {
			html += `
				<tr data-jsc-part="colorRow" data-index="${index}">
					<td class="popularity-column">${e.popularity}</td>
					<td><a href="${e.fullUrl}" target="_blank">${e.name}</a></td>
					<td class="favorite-column favorite-cell ${e.isFavorite ? 'active' : ''}" data-jsc-part="colorFavorite">★</td>
					<td class="color-cell clickable" data-jsc-part="avgColorCell" data-rgb="${e.avgColor}">
						<div class="color" style="background-color:${e.avgColor};"></div>
					</td>
				</tr>
			`;
		}

		html += `</table>`

		this.#app.innerHTML = html;
		this.#root          = this.#app.querySelector('[data-jsc="Colors"]');

		this._initEvents();
	}



	_renderFavorite (index) {
		let fav      = this.#root.querySelector(`[data-jsc-part="colorRow"][data-index="${index}"] [data-jsc-part="colorFavorite"]`);
		let isActive = this.#colorsDataList[index].isFavorite;

		if (isActive) {
			fav.classList.add('active');
		} else {
			fav.classList.remove('active');
		}
	}



	_getUserData () {
		let data = localStorage.getItem('userData');

		if (data) {
			data = JSON.parse(data);
		} else {
			data = {
				favoritesMap: {},
			};
		}

		return data;
	}



	_setUserData (data) {
		localStorage.setItem('userData', JSON.stringify(data));
	}



	_sortByPopularity () { this.#colorsDataList.sort((a, b) => a.popularity - b.popularity); }

	_sortByFavorite () { this.#colorsDataList.sort((a, b) => +b.isFavorite - (+a.isFavorite)); }

	_sortByName () { this.#colorsDataList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())); }
}
