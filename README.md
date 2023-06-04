# QuadTree
Implementation of a QuadTree with a simple visual representation of counting points in a rectangle selection.

If you simply iterate over all points and check if they are in the rectangle, the worst-case time complexity would be O(n) or linear where n is the total number of points. The quad tree data structure can optimize the counting process and reduce the number of operations O(k + log n) - k is the number of points within the rectangle.

A quad tree is a tree data structure commonly used to partition a 2D space into smaller regions. Each node in the quad tree represents a region of the space, and points are stored within the appropriate nodes based on their positions.

To count the points within a rectangle using a quad tree, you would perform a range query on the tree. Starting from the root node, you would traverse the tree and visit only the nodes that intersect with the rectangle. This traversal can be done efficiently by using the properties of the quad tree and its spatial partitioning.

The worst-case time complexity of a range query on a balanced quad tree is logarithmic, i.e., O(log n), where n is the total number of points in the quad tree. Additionally, you need to iterate over the points within the rectangle, which would take O(k) time, where k is the number of points within the rectangle.

Therefore, the overall worst-case time complexity of counting the points within a rectangle using a quad tree would be O(k + log n). This is a significant improvement compared to the linear time complexity of O(n) when using a simple iteration over all points.

References
 - Cool video from TheCodingTrain https://www.youtube.com/watch?v=OJxEcs0w_kE
 - Cool drawing library https://p5js.org/
