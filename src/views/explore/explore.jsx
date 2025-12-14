const bindAll = require('lodash.bindall');
const classNames = require('classnames');
const injectIntl = require('react-intl').injectIntl;
const FormattedMessage = require('react-intl').FormattedMessage;
const React = require('react');
const render = require('../../lib/render.jsx');
const {connect} = require('react-redux');

const api = require('../../lib/api');
const intlShape = require('../../lib/intl-shape');
const PropTypes = require('prop-types');
const {getLocale} = require('../../lib/locales.js');

const Page = require('../../components/page/www/page.jsx');
const Tabs = require('../../components/tabs/tabs.jsx');
const TitleBanner = require('../../components/title-banner/title-banner.jsx');
const Button = require('../../components/forms/button.jsx');
const Form = require('../../components/forms/form.jsx');
const Select = require('../../components/forms/select.jsx');
const SubNavigation = require('../../components/subnavigation/subnavigation.jsx');
const Grid = require('../../components/grid/grid.jsx');

require('./explore.scss');

class Explore extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'getExploreState',
            'handleGetExploreMore',
            'handleChangeSortMode',
            'handleToggleRemoveButton',
            'handleRemove',
            'getBubble'
        ]);

        this.state = this.getExploreState();
        this.state.loaded = [];
        this.state.offset = 0;
        this.state.showRemoveButton = false;
    }

    componentDidMount () {
        this.handleGetExploreMore();
    }

    getExploreState () {
        const categoryOptions = {
            all: '*',
            animations: 'animations',
            art: 'art',
            games: 'games',
            music: 'music',
            stories: 'stories',
            tutorials: 'tutorial'
        };

        const typeOptions = ['projects', 'studios', 'users'];
        const modeOptions = ['trending', 'popular', ''];

        let pathname = window.location.pathname.toLowerCase();
        if (pathname[pathname.length - 1] === '/') {
            pathname = pathname.substring(0, pathname.length - 1);
        }

        const options = pathname.split('/');
        const type = options[2];
        const currentCategory = options[3];
        const currentMode = options.length > 4 ? options[4] : '';

        if (
            typeOptions.indexOf(type) === -1 ||
            (type !== 'users' && Object.keys(categoryOptions).indexOf(currentCategory) === -1) ||
            modeOptions.indexOf(currentMode) === -1
        ) {
            window.location = `${window.location.origin}/explore/projects/all/`;
        }

        return {
            category: currentCategory,
            acceptableTabs: categoryOptions,
            acceptableTypes: typeOptions,
            acceptableModes: modeOptions,
            itemType: type,
            mode: currentMode,
            loadNumber: 16
        };
    }

    handleGetExploreMore () {
        const locale = getLocale();

        const qText =
            this.state.itemType === 'users'
                ? ''
                : `&q=${this.state.acceptableTabs[this.state.category]}`;

        const mode =
            this.state.itemType === 'users'
                ? ''
                : `&mode=${this.state.mode || 'trending'}`;

        const queryString =
            `limit=${this.state.loadNumber}&offset=${this.state.offset}&language=${locale}${mode}${qText}`;

        api({
            uri: `/explore/${this.state.itemType}?${queryString}`
        }, (err, body) => {
            if (!err) {
                const loadedSoFar = this.state.loaded;
                Array.prototype.push.apply(loadedSoFar, body);
                this.setState({
                    loaded: loadedSoFar,
                    offset: this.state.offset + this.state.loadNumber
                });
            }
        });
    }

    handleChangeSortMode (name, value) {
        if (this.state.acceptableModes.indexOf(value) !== -1) {
            window.location =
                `${window.location.origin}/explore/${this.state.itemType}/${this.state.category}/${value}`;
        }
    }

    handleToggleRemoveButton (e) {
        this.setState({showRemoveButton: e.target.checked});
    }

    handleRemove (item) {
        api({
            uri: `/admin/search/${this.state.itemType.slice(0, -1)}/${item.id}`,
            method: 'DELETE'
        }, err => {
            if (err) {
                alert('Error removing item.');
                console.error(err);
            } else {
                const updated = this.state.loaded.filter(p => p.id !== item.id);
                this.setState({loaded: updated});
            }
        });
    }

    getBubble (type) {
        const classes = classNames({
            active: (this.state.category === type)
        });

        return (
            <a href={`/explore/${this.state.itemType}/${type}/${this.state.mode}`}>
                <li className={classes}>
                    <FormattedMessage id={`general.${type}`} />
                </li>
            </a>
        );
    }

    render () {
        return (
            <div>
                <div className="outer">
                    <TitleBanner className="masthead">
                        <div className="inner">
                            <h1 className="title-banner-h1">
                                <FormattedMessage id="general.explore" />
                            </h1>
                        </div>
                    </TitleBanner>

                    <Tabs
                        activeTabName={this.state.itemType}
                        items={[
                            {
                                name: 'projects',
                                onTrigger: () => {
                                    window.location =
                                        `${window.location.origin}/explore/projects/${this.state.category}/${this.state.mode}`;
                                },
                                getContent: isActive => (
                                    <div>
                                        <img
                                            className="tab-icon projects"
                                            src={`/svgs/tabs/projects-${isActive ? 'active' : 'inactive'}.svg`}
                                            alt=""
                                        />
                                        <FormattedMessage id="general.projects" />
                                    </div>
                                )
                            },
                            {
                                name: 'studios',
                                onTrigger: () => {
                                    window.location =
                                        `${window.location.origin}/explore/studios/${this.state.category}/${this.state.mode}`;
                                },
                                getContent: isActive => (
                                    <div>
                                        <img
                                            className="tab-icon studios"
                                            src={`/svgs/tabs/studios-${isActive ? 'active' : 'inactive'}.svg`}
                                            alt=""
                                        />
                                        <FormattedMessage id="general.studios" />
                                    </div>
                                )
                            },
                            {
                                name: 'users',
                                onTrigger: () => {
                                    window.location =
                                        `${window.location.origin}/explore/users/all/`;
                                },
                                getContent: () => (
                                    <div>
                                        <img
                                            className="tab-icon users"
                                            src="/svgs/tabs/users.svg"
                                            alt=""
                                        />
                                        <FormattedMessage id="general.users" />
                                    </div>
                                )
                            }
                        ]}
                    />

                    <div className="sort-controls">
                        {this.state.itemType !== 'users' && (
                            <SubNavigation className="categories">
                                {this.getBubble('all')}
                                {this.getBubble('animations')}
                                {this.getBubble('art')}
                                {this.getBubble('games')}
                                {this.getBubble('music')}
                                {this.getBubble('stories')}
                                {this.getBubble('tutorials')}
                            </SubNavigation>
                        )}

                        {this.state.itemType !== 'users' && (
                            <Form className="sort-mode">
                                <Select
                                    aria-label={this.props.intl.formatMessage({id: 'general.status'})}
                                    name="sort"
                                    options={[
                                        {
                                            value: 'trending',
                                            label: this.props.intl.formatMessage({id: 'explore.trending'})
                                        },
                                        {
                                            value: 'popular',
                                            label: this.props.intl.formatMessage({id: 'explore.popular'})
                                        }
                                    ]}
                                    value={this.state.mode}
                                    onChange={this.handleChangeSortMode}
                                />
                            </Form>
                        )}
                    </div>

                    {this.props.session?.session?.permissions?.admin && (
                        <div className="sort-controls">
                            <label>
                                <span>Removal mode: </span>
                                <input
                                    type="checkbox"
                                    checked={this.state.showRemoveButton}
                                    onChange={this.handleToggleRemoveButton}
                                />
                            </label>
                        </div>
                    )}

                    <div id="projectBox">
                        <Grid
                            cards
                            showAvatar
                            itemType={this.state.itemType}
                            items={this.state.loaded}
                            showFavorites={false}
                            showLoves={false}
                            showViews={false}
                            showRemoveButton={this.state.showRemoveButton}
                            onRemove={this.handleRemove}
                        />
                        <Button onClick={this.handleGetExploreMore}>
                            <FormattedMessage id="general.loadMore" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

Explore.propTypes = {
    intl: intlShape,
    session: PropTypes.object
};

const mapStateToProps = state => ({
    session: state.session
});

const ConnectedExplore = connect(mapStateToProps)(injectIntl(Explore));
render(<Page><ConnectedExplore /></Page>, document.getElementById('app'));
