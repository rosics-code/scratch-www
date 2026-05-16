const React = require('react');
const PropTypes = require('prop-types');

class NativeCarousel extends React.Component {
    render () {
        const {items} = this.props;

        if (!items || items.length === 0) return null;

        return (
            <div className="scratch-native-carousel-wrapper">
                <div className="scratch-native-carousel">
                    {items.map((item, index) => {
                        const projectId = item.id;
                        const projectTitle = item.title;
                        const projectThumb = item.image || `//uploads.scratch.mit.edu/projects/thumbnails/${projectId}.png`;
                        const author = item.creator || (item.author && item.author.username);

                        return (
                            <div className="scratch-native-slide" key={projectId || index}>
                                <div className="scratch-project-card">
                                    <a href={`/projects/${projectId}/`}>
                                        <img 
                                            src={projectThumb} 
                                            alt={projectTitle} 
                                            className="scratch-project-thumb" 
                                        />
                                    </a>
                                    <div className="scratch-project-info">
                                        <a href={`/projects/${projectId}/`} className="scratch-project-title">
                                            {projectTitle}
                                        </a>
                                        {author && (
                                            <a href={`/users/${author}/`} className="scratch-project-author">
                                                by {author}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

NativeCarousel.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object)
};

NativeCarousel.defaultProps = {
    items: []
};

module.exports = NativeCarousel;
