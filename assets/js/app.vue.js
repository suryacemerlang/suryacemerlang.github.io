// USEFUL FUNCTION DECLARATION	
// ////////////////////////////////////////////////
var sortedByLabel = new Map();

// BEGIN COMPONENT DECLARATION
// ////////////////////////////////////////////////
/**
 * list menu header
 */
Vue.component("list-menu", {
	data: function(){
		return {}
	},
	template:`
		<div></div>
	`
})

// HEADER COMPONENT
// ////////////////////////////////////////////////





// MAIN SECTION COMPONENT
// ////////////////////////////////////////////////


/**
 * POST-ACTIVITY BEGIN
 * [list-post] POST-ACTIVITY
 */
Vue.component('list-post', {
	template:`
		<div class="bg-light p-1 m-1 rounded">
				<a :href="post.url">
					{{post.title}}
				</a><br>
				<span style="font-size:11px"><em>{{ new Date(post.published).toLocaleDateString() }} | {{ post.author.displayName }}</em></span>
		</div> 
	`,
	props: {
    post: Object
  }
});

/**
 * [list-category] POST-ACTIVITY
 */
Vue.component('list-category', {
	data: function(){
		return {
			base_uri:"http://blog.surya-cemerlang.co.id"
		}
	},
	template:`
		<div class="col-md-3">
			<h2 style="text-decoration:underline">{{ category }}</h2>
			<span v-if="!seen" style="font-size:11px">no post yet</span>
			<list-post v-if="seen" v-for="entry in entries" 
				:key="entry.id"
				:post="entry"
			>
			</list-post>
			<span v-if="ismore">
				<a :href="morelink(category)" style="font-size:12px"> more about {{category}}</a>
			</span>
		</div>
	`,
	methods:{
		morelink: function(category){
			return this.base_uri+'/search/label/'+category
		}
	},
	props:{
		seen: Boolean,
		entry: Object,
		entries: Array,
		category: String,
		ismore: Boolean
	}

});

/**
 * [Post-activity] POST-ACTIVITY
 */
Vue.component('post-activity', {
	data: function(){
		return {
			base_serv: "https://script.google.com/macros/s/AKfycby_ieCMCLP1DVbg5LHVKzkphfuxZR8B8P5y8GOtyiH1KKZ4vjUmZZAh3fzt3rBDuGq3/exec",
			bindLabels:[
				"News",
				"Announcement",
				"Publications",
				"References"
			],
			raw_labels: new Map(),
			labels: sortedByLabel,
			limit: 3
		}
	},
	template:`
		<div class="container">
			<div class="row">
				<list-category v-for="labelKey in bindLabels"
					:key="labelKey"
					:category="labelKey"
					:entries="labels.get(labelKey)"
					:seen="labelAvail(labelKey)"
					:ismore="raw_labels.get(labelKey)? raw_labels.get(labelKey).length>limit: false"
				></list-category>
			</div>
		</div>
	`,
	props:{
		seen: Boolean,
		entries:Array
	},
	methods:{
		labelAvail: function(key){
			return (this.labelKeys).includes(key);
		},
		labelSort: function(data,limit){
			var collection = new Map();
			data.map((e, i) => {
                var labels = e.labels;
                if(labels && labels.length){
                    labels.map(c => {
                        if (collection.has(c)){
                            var col = collection.get(c)
							if(limit){
								if(col.length < limit) col.push(e);
							}else{
								col.push(e);
							}
                        }else{
                            var newCol = collection.set(c,[]);
                            newCol.get(c).push(e);
                        }
                    });
                } else {
                    var c = "other";
                    if (collection.has(c)){
                        collection.get(c).push(e);
                    }else{
                        var newCol = collection.set(c,[]);
                        newCol.get(c).push(e);
                    }
                }
					
			});
			return collection;
		},
		slicebylimit: function(data){
			console.log(data)
			return data? data.splice(0,this.limit): null;
		},
		ismore: function(labelKey){
			var data = this.raw_labels.get(labelKey);
			if(!data) return false;
			return data.length > this.limit;
		}
	},
	computed:{
		labelKeys: function(){
			let labels = this.labels
			return [...labels.keys()];
		}
	},
	created: function(){
		const req_server = this.base_serv+"?m=getPosts&id=";
		fetch(req_server)
		.then(response => response.json())
		.then(data => {
			if(data.items){
				this.raw_labels = this.labelSort(data.items);
				this.labels = this.labelSort(data.items, this.limit);
			}
		});
	}
});
// ENDOF POST-ACTIVITY

/**
 * [NEWletter] MAIN SECTION
 */
Vue.component("newsletter-section", {
	data: function(){
		return {
			title:"ACTIVITY",
			description: ""
		}
	},
	template:`
		<section id="Newsletter" style="min-height: 200px">
			<div class="container mb-3" data-aos="fade-up">
				<div class="section-header">
					<h3 class="section-title">{{title}}</h3>
					<p 
						v-if="description"
						class="section-description"
					>
						{{description}}
					</p>
				</div>
				<div class="">
					<div class="col-md-3">
						<div class="text-center" style="font-size: 72px; color: #666666;"><i class="fa fa-newspaper-o"></i></div>
					</div>
					<post-activity class="row"></post-activity>
				</div>
			</div>
		</section>
	`
});



/**
 * [About] MAIN SECTION
 */
Vue.component("about-section", {
	data: function(){
		return {
			title: "Sedikit Tentang Kami",
			about: `
				Kami adalah perusahaan kecil menegah yang bergerak dalam bidang jasa konsultasi lingkungan. Berdiri sejak <strong class="y-founded"></strong>, 
				setidaknya genap sudah <strong class="y-experienced"></strong> pengalaman kami dalam jasa konsultasi. 
				Menjalankan fungsi perencanaan dan pemantauan, kami terus belajar dan berinovasi demi terwujutnya visi lingkungan hidup yang sehat.
			`,
			links: [
				{
					title: "Legal & Badan Hukum",
					description: "Dokumen perusahaan, dokumen resmi pendukung termasuk didalamnya Company Profile ...",
					url: "#",
					icon: "fa fa-institution"
				},
				{
					title: "Galeri & Dokumentasi",
					description: "Foto dokumentasi proyek, meeting, kegiatan kantor lainnya ...",
					url: "#",
					icon: "fa fa-photo"
				},
				{
					title: "Publikasi",
					description: "Softcopy handout meeting, hasil publikasi, bahan presentasi, ...",
					url: "#",
					icon: "fa fa-pencil-square-o"
				}
			]
		}
	},
	template:`
		<section id="about">
			<div class="container" data-aos="fade-up">
				<div class="row about-container">
					<div class="col-lg-6 content order-lg-1 order-2">
						<h2 class="title mt-4" >{{title}}</h2>
						<p v-html="about"></p>
						<div 
							v-for="link in links"
							:key="link.title"
							class="icon-box" 
							data-aos="fade-up" 
							data-aos-delay="100"
						>
							<div class="icon"><i :class="link.icon"></i></div>
							<h4 class="title"><a href="" style="color:#2557e6">{{link.title}}</a></h4>
							<p class="description" style="color:#2faf55">{{link.description}}</p>
						</div>
					</div>
					<div class="col-lg-6 background order-lg-2 order-1" data-aos="fade-left" data-aos-delay="100"></div>
				</div>
			</div>
		</section>
	`,
	props: {
		founded: {
			type: Number,
			required: true
		}
	},
	mounted: function(){
		var year_founded = this.founded;
		var cur_year = new Date().getFullYear();
		var experienced = cur_year - year_founded;
		$(".y-founded")[0].innerHTML = year_founded;
		$(".y-experienced").each( (i,e) => e.innerHTML = experienced+"thn");
	}
});


Vue.component("slice-component", {
	template:`
		<div>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 96">
			  <path fill="#c0ffbe" fill-opacity="1" d="M0,96L1440,0L1440,96L0,96Z"></path>

			  <text x="600" y="140" fill="#37D667" class="fa" transform="rotate(-3)" style="font-size:8em;">&#xf18c;</text>
				<text x="1200" y="130" fill="#37D667" class="fa" transform="rotate(-3)" style="font-size:8em;">+</text>
				<text x="1000" y="100" fill="#fff" class="fa" transform="rotate(-5,30)" style="font-size:6em;">+</text>
				<text x="1100" y="100" fill="#9BEAB3" class="fa" transform="rotate(-5,30)" style="font-size:5em;">+</text>
				<text x="1300" y="80" fill="#9BEAB3" class="fa" transform="rotate(-6,30)" style="font-size:4em;">&#xf03e;</text>
				<text x="1100" y="100" fill="#fff" class="fa" rotate="-15" style="font-size:7em;">+</text>
			</svg>
			<slot></slot>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 128">
			  <path fill="#c0ffbe" fill-opacity="1" d="M0,128L1440,64L1440,0L0,0Z"></path>

			  <text x="110" y="120" fill="#37D667" class="fa" transform="rotate(-3)" style="font-size:6em;">&#xf15c;</text>
			  <text x="230" y="70" fill="#37D667" class="fa" transform="rotate(8)" style="font-size:4em;">&#xf1c1;</text>
			  <text x="50" y="140" fill="#fff" class="fa" transform="rotate(-5)" style="font-size:8em;">#;</text>

			</svg>
		</div>
	`
})



/**
 * [fact] MAIN SECTION
 */
Vue.component("fact-section", {
	data: function(){
		return {
			title: "What We Have Done", 
			description: `
				Selama <strong class="y-experienced"></strong> mengabdi, berikut ringkas perjalanan kami:
			`,
			counters: [
				{
					count: 232,
					title: "Clients"
				},
				{
					count: 521,
					title: "Projects"
				},
				{
					count: 463,
					title: "Hours Of Support"
				},
				{
					count: 315,
					title: "Repports"
				}
			]
		}
	},
	template:`	
		<section id="facts">
			<slice-component>
				<div style="background-color: #c0ffbe" class="m-0 p-0">
					<div class="container"  data-aos="fade-up">
						<div class="section-header">
							<h3 class="section-title m-0">{{title}}</h3>
							<p class="section-description text-succes" v-html="description"></p>
						</div>
						<div
							class="row counters"
						>
							<div 
								v-for="counter in counters" 
								class="col-lg-3 col-6 text-center"
							>
								<span data-toggle="counter-up">{{counter.count}}</span>
								<p>{{counter.title}}</p>
							</div>
						</div>
					</div>
				</div>
			</slice-component>
		</section>
	`
});



/**
 * [services] MAIN SECTION
 */
Vue.component("services-section", {
	data: function(){
		return {
			title: "SERVICES",
			description: "Kami bergerak di bidang jasa konsultasi, berikut adalah beberapa jasa yang kami tawarkan:",
			services: [
				{
					title: "Konsultasi Lingkungan",
					description: "",
					url: "#",
					icon: "fa fa-pagelines"
				},
				{
					title: "Dokumen AMDAL",
					description: "",
					url: "#",
					icon: "fa fa-file-text-o"
				},
				{
					title: "Pemantauan Lingkungan",
					description: "",
					url: "#",
					icon: "fa fa-flask"
				}
			]
		}
	},
	template: `
		<section id="services">
			<div class="container" data-aos="fade-up">
				<div class="section-header">
					<h3 class="section-title">{{title}}</h3>
					<p v-if="description" class="section-description">
						{{description}}
					</p>
				</div>
				<div class="row">
					<div 
						v-for="service in services"
						class="col-lg-4 col-md-6" 
						data-aos="zoom-in"
					>
						<div class="box">
							<div class="icon">
								<a :href="service.url">
									<i :class="service.icon"></i>
								</a>
							</div>
							<h4 class="title">
								<a :href="service.url">
									{{service.title}}
								</a>
							</h4>
							<p 
								v-if="service.description"
								class="description"
							>
								{{service.description}}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	`
});



/**
 * [call to action] MAIN SECTION
 */
Vue.component("call-to-action-section", {
	data: function(){
		return {
			title: "Call to Acction",
			description: "test"
		}
	},
	template: `
		<section id="call-to-action">
			<div class="container">
				<div class="row" data-aos="zoom-in">
					<div class="col-lg-9 text-center text-lg-left">
						<h3 class="cta-title">
							{{title}}
						</h3>
						<p 
							v-if="description"
							class="cta-text"
						>
							{{description}}
						</p>
					</div>
					<div class="col-lg-3 cta-btn-container text-center">
						<a class="cta-btn align-middle" href="#">Call To Action</a>
					</div>
				</div>
			</div>
		</section>				
	`
});


Vue.component("contact-section", {
	data: function(){
		return {

		}
	},
	template: `
		<section id="contact" class="pb-0">
			<div class="container">
				<div class="section-header">
					<h3 class="section-title">Contact</h3>
					<p class="section-description">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque</p>
				</div>
			</div>
			<!-- Uncomment below if you wan to use dynamic maps -->
			<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6653.397098475638!2d112.68386229421344!3d-7.450469986169888!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7e10123322055%3A0x3fb58254a0c2490!2sSurya%20Cemerlang.%20CV!5e0!3m2!1sen!2sid!4v1623132889972!5m2!1sen!2sid" width="100%" height="380" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
			<div id="footer" class="p-0">
				<wave></wave>
				<div
					class="container-fluid text-light"
					style="background: #32C15D; min-height: 150px"
				>
				<div class="container" id="footer-info">
					<div class="row">
						<div class="col-lg-4 p-2" id="contact">
							<footer-info></footer-info>
							<footer-component></footer-component>
							</div>
							<div class="col-lg-4 p-2"></div>
							<div class="col-lg-4 p-2"></div>
						</div>
					</div>
				</div>
				<cp-right></cp-right>
					
				</div>
		</section>
	`
});

// Vue.component("", {
// 	data: function(){
// 		return {

// 		}
// 	},
// 	template: ``
// });








// FOOTER SECTION COMPONENT
// ////////////////////////////////////////////////


// ENDOF COMPNENT DECLARATION
// instance (unaplied)