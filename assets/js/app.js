var sortedByLabel = new Map();


// contruct list-post component
///////////////////////////////////////////////////////////////////////
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


// contruct list-category component
///////////////////////////////////////////////////////////////////////
Vue.component('list-category', {
	data: function(){
		return {
			base_uri:"http://blog.surya-cemerlang.co.id"
		}
	},
	template:`
		<div class="col-md-3">
			<h2 style="text-decoration:underline; color:#2557e6">{{ category }}</h2>
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

// construct Post-activity component
///////////////////////////////////////////////////////////////////////
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


/////////////////////////////////////////////////////
// Member and Owl Carousel Aviliated, Client
// declare component
// endpoint side server
var data_endpoint = "https://script.google.com/macros/s/AKfycbyYEALLK7s0yALbNzLRjuRihfb_1mSgG4BdEIrBygQtDnchYs_r/exec";
var owl = {};


// declare carousel things
Vue.component("cs-carousel", {
	data: function(){
		return {
			width: "7em",
			opt: {
				loop:true,
				margin:10,
				nav:false,
				responsive:{
					0:{
						items:3
					},
					600:{
						items:5
					},
					1000:{
						items:7
					}
				}
			},
			items:[],
		}
	},
	template:`
		<div class="container section-header align-items-center text-center mb-2">
			<h3 class="section-title text-light">{{title}}</h3>
      <span
				v-if="description" 
				class="section-description"
			>
				{{description}}
			</span>
			<div v-if="!items.length" class="mb-3">Loading...</div>
			<div
				v-if="items.length" 
				:class="classCarousel"
			>
				<div
					v-for="item in items"
					class="item"
				>
					<div 
					class="bg-img on-mouse-color"
					:style="{
						width: width,
						height: width,
						backgroundImage: 'Url('+(item.image? item.image : 'assets/img/sc-profile/file-no-photo.png')+')'
					}"
					></div>
				</div>
			</div>
		</div>
	`,
	props:{
		"title":{
			type:String,
			required:true
		},
		"description":{
			type:String,
			required: false
		},
		"dataclass":{
			type: String,
			required: true
		},
		"m":{
			type: String,
			required: true
		}
	},
	computed:{
		classCarousel: function(){
			return "owl-carousel owl-theme "+ this.dataclass
		}
	},
	beforeMount: function(){
		fetch(data_endpoint+"?m="+this.m)
			.then(r => r.json())
			.then(data => this.items = data);
	},
	updated: function(){
		$("."+this.dataclass).owlCarousel(this.opt);
		$("."+this.dataclass).on('mousewheel', '.owl-stage', function (e) {
				if (e.deltaY>0) {
						$(this).trigger('next.owl');
				} else {
						$(this).trigger('prev.owl');
				}
				e.preventDefault();
		});
	}
})

// declare sc-socials
Vue.component("sc-socials", {
	data: function(){
		return {}
	},
	template:`
		<div class="container social">
			<span v-if="!socials.length">* * * *</span>
			<a v-for="social in socials"
				class="m-2"
				:href="social.url"
			>
				<i :class="social.icon"></i>
			</a>
		</div>
	`,
	props:{
		socials:{
			type: Array,
			required: true
		}
	}
})



// declare sc-profile
Vue.component("sc-profile", {
	data: function(){
		return {
			members:[],
		}
	},
	template:`
		<div class="container section-header align-items-center text-center">
			<h3 class="section-title">Team</h3>
      <p class="section-description">Sapa tim profesional kami</p>
			<div v-if="!members.length">Loading...</div>
			<div 
				v-if="members.length"
				class="row d-flex justify-content-center"
			>
				<div
					v-for="member in members"
					class="card col-lg-3 col-md-6 mb-2 align-items-center text-center aos-init aos-animate" data-aos="fade-up" data-aos-delay="100"
					data-aos-once="true"
					style="width: 15rem; border:none"
				>
					<div class="card-img-top bg-img"
						:style="{
							backgroundColor: 'var(--bs-gray-200)',
							filter:'brightness(1.2) contrast(1.5)',
							backgroundImage: 'Url('+(member.profile? member.profile : member.gender>0?'assets/img/sc-profile/profile-no-photo.png' : 'assets/img/sc-profile/profile-no-photo2.png')+')',
						}
						"
					>
					</div>
					<div class="card-body">
						<h5 class="card-title">{{member.name}}</h5>
						<i class="card-text" style="font-size:12px">{{member.jobdesk}}</i>
						<sc-socials
							:socials="member.socials"
						/>
					</div>
				</div>
			</div>
		</div>
	`,
	mounted: function(){
		fetch(data_endpoint+"?m=getMainMember")
			.then(r => r.json())
			.then(data => this.members = data);
	}
})


// foooter
// 
// wave component
Vue.component("wave", {
	data: function(){
		return {}
	},
	template:`
		<svg 
			xmlns="http://www.w3.org/2000/svg" 
			viewBox="0 120 1440 200"
		>

			<path fill="#000" fill-opacity="1" d="M0,256L60,256C120,256,240,256,360,250.7C480,245,600,235,720,234.7C840,235,960,245,1080,261.3C1200,277,1320,299,1380,309.3L1440,320L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
			<path fill="#37D667" fill-opacity="0.5" d="M0,224L60,234.7C120,245,240,267,360,266.7C480,267,600,245,720,229.3C840,213,960,203,1080,202.7C1200,203,1320,213,1380,218.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
			<path fill="#37D667" fill-opacity="0.8" d="M0,128L60,128C120,128,240,128,360,144C480,160,600,192,720,213.3C840,235,960,245,1080,256C1200,267,1320,277,1380,282.7L1440,288L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
			
			<text x="900" y="270" fill="#37D667" class="fa" transform="rotate(-3)" style="font-size:80px;">&#xf06c;</text>
			<text x="1200" y="270" fill="#37D667" class="fa" transform="rotate(-3)" style="font-size:80px;">+</text>
			<text x="1000" y="300" fill="#fff" class="fa" transform="rotate(-5,30)" style="font-size:42px;">+</text>
			<text x="1100" y="200" fill="#9BEAB3" class="fa" transform="rotate(-5,30)" style="font-size:42px;">+</text>
			<text x="1300" y="220" fill="#9BEAB3" class="fa" transform="rotate(-5,30)" style="font-size:66px;">&#xf18c;</text>
			<text x="1100" y="280" fill="#fff" class="fa" rotate="-15" style="font-size:72px;">+</text>


			<image href="assets/img/logo.png" x="50" y="150" alt="CV. Surya Cemerlang" style="filter: brightness(10)"/>

		</svg>
	`
})

// right component
Vue.component("cp-right", {
	template:`
		<div 
			class="bg-dark text-light text-center" 
			style="font-size: 11px; min-height: 150px"
			id="cp-right"
		>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 96">
			<path fill="#32C15D" fill-opacity="1" d="M0,0L1440,96L1440,0L0,0Z"></path>
		</svg>
			<div class="copyright mt-2">
				© Copyright <strong>CV.Surya Cemerlang</strong>. All Rights Reserved
	    </div> 
			<div class="credits">
				Powered by <strong>GB-Sources</strong>, Design with ♥ and <a href="https://bootstrapmade.com/">bootstrapmade</a>
			</div>
		</div>
	`
});

// info component
Vue.component("footer-info", {
	template:`
		<div class="info">
			<h3>contacts</h3>
			<div>
				<i class="fa fa-map-marker"></i> <p>Perumahan Puri Indah CC 8, Suko, Kec.Sidoarjo Kab.Sidoarjo<br>Jawa Timur Kode-Pos.61224</p>
			</div> 
			<div>
				<i class="fa fa-envelope"></i> <p>info@example.com</p>
			</div> 
			<div>
				<i class="fa fa-phone"></i> <p>+1 5589 55488 55s</p>
			</div>
		</div>
	`
})

// social component
Vue.component("footer-component", {
	data: function(){
		return {
			links:{
				twitter: "#",
				facebook: "#",
				instagram: "#",
				google: "#",
				linkedin: "#"
			},
			icons : {
				twitter:"fa fa-twitter",
				facebook: "fa fa-facebook",
				instagram: "fa fa-instagram",
				google: "fa fa-google-plus",
				linkedin: "fa fa-linkedin"
			}
		}
	},
	template:`
		<div class="social-links">
			<a
				v-for="social in Object.keys(links)" 
				:href="links[social]" 
				:class="social+' m-1'"
			>
				<i :class="icons[social]"></i>
			</a>
		</div>
	`
})

