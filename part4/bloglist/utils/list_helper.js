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

module.exports = { dummy, totalLikes, favoriteBlog };
