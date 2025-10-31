import Masonry from 'react-masonry-css';
import PostCard from './PostCard';
import './MasonryGrid.css';

function MasonryGrid({ posts, onPostClick }) {
  const breakpointColumns = {
    default: 5,
    1400: 4,
    1100: 3,
    768: 2,
    500: 1
  };

  return (
    <div className="masonry-container">
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onClick={() => onPostClick(post)} />
        ))}
      </Masonry>
    </div>
  );
}

export default MasonryGrid;

