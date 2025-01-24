import React, { useState, useEffect } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { ChakraProvider, Box, IconButton, useToast, HStack, VStack, Popover, PopoverTrigger, PopoverContent, PopoverBody, SimpleGrid, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Button, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Text, Image } from '@chakra-ui/react';
import { FaCalculator, FaEraser, FaUndo, FaPencilAlt, FaPen, FaPaintBrush, FaMarker, FaPlus, FaHistory } from 'react-icons/fa';
import axios from 'axios';

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [brushColor, setBrushColor] = useState('white');
  const [brushRadius, setBrushRadius] = useState(2);
  const [brushType, setBrushType] = useState('pencil');
  const canvasRef = React.useRef(null);
  const toast = useToast();

  const colors = ['white', '#FF5733', '#33FF57', '#3357FF', '#FFD700', '#FF33F6', '#33FFF6'];
  const brushTypes = [
    { icon: FaPencilAlt, type: 'pencil', label: 'Pencil' },
    { icon: FaPen, type: 'pen', label: 'Pen' },
    { icon: FaPaintBrush, type: 'brush', label: 'Brush' },
    { icon: FaMarker, type: 'marker', label: 'Marker' },
  ];

  const drawResult = (result) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const currentData = canvas.getSaveData();
    const parsedData = JSON.parse(currentData);
    const lastLine = parsedData.lines[parsedData.lines.length - 1];
    
    // Calculate position after the equals sign
    const lastX = Math.max(...lastLine.points.map(p => p.x)) + 20;
    const avgY = lastLine.points.reduce((sum, p) => sum + p.y, 0) / lastLine.points.length;
    
    // Calculate average height of input strokes
    const heights = parsedData.lines.map(line => {
      const yPoints = line.points.map(p => p.y);
      return Math.max(...yPoints) - Math.min(...yPoints);
    });
    const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length;
    
    // Draw the result
    const resultStr = result.toString();
    const ctx = canvas.canvas.drawing.getContext('2d');
    ctx.fillStyle = '#FFD700';
    const fontSize = Math.max(24, avgHeight * 0.8); // Scale font size based on input height
    ctx.font = `${fontSize}px cursive`;
    ctx.fillText(resultStr, lastX, avgY); // Using fillText instead of strokeText for better visibility
  };

  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Load history from localStorage on component mount
    const savedHistory = localStorage.getItem('calculationHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (expression, result) => {
    const newHistoryItem = {
      id: Date.now(),
      expression: expression,
      result: result,
      timestamp: new Date().toLocaleString(),
      page: currentPage
    };
    const updatedHistory = [newHistoryItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('calculationHistory', JSON.stringify(updatedHistory));
  };

  const handleNewPage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.getDataURL();
      const blankCanvas = canvas.getDataURL('blank');
      
      // Only save to history if the canvas is not empty
      if (imageData !== blankCanvas) {
        const timestamp = new Date().toLocaleString();
        const newHistoryItem = {
          id: Date.now(),
          expression: imageData,
          result: 'Page ' + currentPage + ' Archived',
          timestamp: timestamp,
          page: currentPage
        };
        
        setHistory(prevHistory => {
          const updatedHistory = [newHistoryItem, ...prevHistory];
          localStorage.setItem('calculationHistory', JSON.stringify(updatedHistory));
          return updatedHistory;
        });
      }
      
      handleClear();
      setCurrentPage(prev => prev + 1);
      
      toast({
        title: 'New Page Created',
        description: `Switched to page ${currentPage + 1}`,
        status: 'success',
        duration: 2000,
      });
    }
  };

  const handleAutoSolve = async () => {
    try {
      setLoading(true);
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');
  
      const imageData = canvas.getDataURL();
      const response = await axios.post('http://localhost:3001/api/solve', {
        image: imageData
      });
  
      const result = response.data.result;
      drawResult(result);
      saveToHistory(imageData, result);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };

  useEffect(() => {
    const checkForEquals = (event) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const currentData = canvas.getSaveData();
      const parsedData = JSON.parse(currentData);
      if (!parsedData.lines.length) return;

      const lastLine = parsedData.lines[parsedData.lines.length - 1];
      const points = lastLine.points;

      // Simple equals sign detection logic
      const isHorizontalLine = () => {
        const startY = points[0].y;
        return points.every(p => Math.abs(p.y - startY) < 10);
      };

      if (isHorizontalLine() && points.length > 5) {
        handleAutoSolve();
      }
    };

    if (canvasRef.current) {
      canvasRef.current.canvas.drawing.addEventListener('mouseup', checkForEquals);
      return () => {
        if (canvasRef.current) {
          canvasRef.current.canvas.drawing.removeEventListener('mouseup', checkForEquals);
        }
      };
    }
  }, []);

  return (
    <ChakraProvider>
      <Box h="100vh" w="100vw" bg="#1a1a1a" position="relative" overflow="hidden">
        <IconButton
          icon={<FaPlus />}
          aria-label="New Page"
          position="absolute"
          top={4}
          left={4}
          size="md"
          variant="ghost"
          color="white"
          onClick={handleNewPage}
          _hover={{ bg: 'whiteAlpha.200', transform: 'scale(1.1)' }}
          transition="all 0.2s"
          zIndex={2}
        />
        <IconButton
          icon={<FaHistory />}
          aria-label="History"
          position="absolute"
          top={4}
          left={16}
          size="md"
          variant="ghost"
          color="white"
          onClick={onOpen}
          _hover={{ bg: 'whiteAlpha.200' }}
          zIndex={2}
        />
        <HStack position="absolute" top={4} right={4} spacing={3} zIndex={2}>
          <Popover placement="bottom-start">
            <PopoverTrigger>
              <IconButton
                icon={<FaPencilAlt />}
                aria-label="Drawing Tools"
                size="md"
                variant="ghost"
                color={brushColor}
              />
            </PopoverTrigger>
            <PopoverContent bg="gray.800" borderColor="gray.600" w="200px">
              <PopoverBody>
                <SimpleGrid columns={4} spacing={2} mb={4}>
                  {colors.map((color) => (
                    <Box
                      key={color}
                      w="30px"
                      h="30px"
                      borderRadius="md"
                      bg={color}
                      cursor="pointer"
                      onClick={() => setBrushColor(color)}
                      border={brushColor === color ? '2px solid white' : 'none'}
                    />
                  ))}
                </SimpleGrid>
                <SimpleGrid columns={2} spacing={2} mb={4}>
                  {brushTypes.map(({ icon: Icon, type, label }) => (
                    <IconButton
                      key={type}
                      icon={<Icon />}
                      aria-label={label}
                      size="md"
                      variant={brushType === type ? 'solid' : 'ghost'}
                      color={brushColor}
                      onClick={() => setBrushType(type)}
                    />
                  ))}
                </SimpleGrid>
                <Box>
                  <Slider
                    min={1}
                    max={20}
                    value={brushRadius}
                    onChange={(v) => setBrushRadius(v)}
                    mb={2}
                  >
                    <SliderTrack bg="gray.600">
                      <SliderFilledTrack bg={brushColor} />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <IconButton
            icon={<FaEraser />}
            aria-label="Clear"
            size="md"
            variant="ghost"
            color="white"
            onClick={handleClear}
          />
          <IconButton
            icon={<FaUndo />}
            aria-label="Undo"
            size="md"
            variant="ghost"
            color="white"
            onClick={handleUndo}
          />
        </HStack>

        <IconButton
          icon={<FaCalculator />}
          aria-label="Floating Calculator"
          position="fixed"
          bottom={8}
          right={8}
          size="lg"
          colorScheme="blue"
          isLoading={loading}
          onClick={handleAutoSolve}
          boxShadow="lg"
          borderRadius="full"
          _hover={{ transform: 'scale(1.1)' }}
          transition="all 0.2s"
          zIndex={2}
        />

        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="gray.900">
            <DrawerCloseButton color="white" />
            <DrawerHeader color="white">Calculation History</DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align="stretch" color="white">
                {history.map((item) => (
                  <Box
                    key={item.id}
                    p={4}
                    bg="whiteAlpha.100"
                    borderRadius="md"
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.400">
                          {item.timestamp}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          Page {item.page}
                        </Text>
                      </HStack>
                      {item.expression !== `Page ${item.page - 1}` && (
                        <Box
                          borderRadius="md"
                          overflow="hidden"
                          maxH="100px"
                        >
                          <Image
                            src={item.expression}
                            alt="Calculation"
                            objectFit="contain"
                            w="100%"
                            h="100%"
                          />
                        </Box>
                      )}
                      <Text fontSize="xl" fontWeight="bold">
                        {item.result}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Box position="absolute" top={0} left={0} zIndex={1}>
          <CanvasDraw
            ref={canvasRef}
            brushRadius={brushRadius}
            lazyRadius={0}
            brushColor={brushColor}
            backgroundColor="black"
            canvasWidth={window.innerWidth}
            canvasHeight={window.innerHeight}
            hideGrid
          />
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default App;