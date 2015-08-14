
var MediaItem = React.createClass({
    render: function() {
        return (
            <a class="image" data-gallery="multiimages" data-toggle="lightbox"
                data-title={this.props.image.name} href={this.props.image.path}>
                <img src={this.props.image.path} />
            </a>
        )
    }
})

var HomePageContainer = React.createClass({
    render: function() {
        if (this.props.images.length == 0)
            return (
                <div>No images uploaded</div>
            )
        var images = []
        this.props.images.forEach(function(image) {
            images.push(<MediaItem image={image} key={image.path}/>);
        });
        return (<div>{images}</div>)
    }
});
React.render(<HomePageContainer images={IMAGES}/>, document.getElementById('main'));