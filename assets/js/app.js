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
			<h3 class="section-title">{{title}}</h3>
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
						backgroundImage: 'Url('+(item.image? item.image : '/assets/img/sc-profile/file-no-photo.png')+')'
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
							backgroundImage: 'Url('+(member.profile? member.profile : member.gender>0?'/assets/img/sc-profile/profile-no-photo.png' : '/assets/img/sc-profile/profile-no-photo2.png')+')',
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