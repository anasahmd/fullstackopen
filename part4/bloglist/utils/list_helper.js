const _ = require('lodash');

const dummy = (blogs) => {
	return 1;
};

const totalLikes = (blogs) => {
	return blogs.reduce((total, blog) => {
		return total + blog.likes;
	}, 0);
};

const favoriteBlog = (blogs) => {
	return blogs.length === 0
		? {}
		: blogs.reduce((mostLiked, blog) => {
				return mostLiked.likes > blog.likes ? mostLiked : blog;
		  }, blogs[0]);
};

const mostBlogs = (blogs) => {
	if (blogs.length === 0) return {};

	const authorCounts = _.countBy(blogs, 'author');
	const authorCountsPair = _.toPairs(authorCounts);

	const [author, blogsCount] = _.maxBy(authorCountsPair, (pair) => pair[1]);

	return { author, blogs: blogsCount };
};

const mostLikes = (blogs) => {
	if (blogs.length === 0) return {};

	let groupByAuthor = _.groupBy(blogs, 'author');

	// returns in the format [{author: 'Author', totalLikes: 2}, {author: 'Author 2', totalLikes: 5}]
	let totalLikesOfAuthor = _.map(groupByAuthor, (posts, author) => {
		return {
			author,
			totalLikes: _.reduce(
				posts,
				(totalLikes, post) => {
					return totalLikes + post.likes;
				},
				0
			),
		};
	});

	let authorWithMaxLikes = _.maxBy(totalLikesOfAuthor, 'totalLikes');

	return {
		author: authorWithMaxLikes.author,
		likes: authorWithMaxLikes.totalLikes,
	};
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
