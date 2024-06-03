import React, { useState } from "react";
import * as _ from "underscore";
import Tool from "./Tool";
import { useRecoilState, useRecoilValue } from "recoil";
import { imageState, clicksState} from "../../services/state";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Stack, Button} from "@mui/material";

const Stage = () => {
  const image = useRecoilValue(imageState);
  const [, setClicks] = useRecoilState(clicksState);
  const [clickType, setClickType] = useState(1);

  const getClick = (x, y, type) => {
    return { x, y, clickType: type };
  };

  const resetClicks = () => {
    setClicks([])
  }

  const handleClickTypeChange = (event) => {
    setClickType(event.target.value);
  };

  const handleMouseMove = _.throttle((e) => {
    let el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    const click = getClick(x, y, clickType);
    if (click) setClicks((currentClicks) => [...currentClicks, click]);
  }, 15);

  const flexCenterClasses = "flex items-center justify-center";
  return (
    <Stack>
      <div className={`${flexCenterClasses} w-full h-full`}>
        <div className={`${flexCenterClasses} relative w-[90%] h-[90%]`}>
          <Tool handleMouseMove={handleMouseMove} />
        </div>
      </div>
      <Stack direction="row">
      <FormControl sx={{margin: '1rem'}}>
        <FormLabel id="click-type-group">Choice: </FormLabel>
        <RadioGroup
          row
          aria-labelledby="click-type-group"
          name="controlled-click-type-group"
          value={clickType}
          onChange={handleClickTypeChange}
        >
          <FormControlLabel value={1} control={<Radio />} label="Add" />
          <FormControlLabel value={0} control={<Radio />} label="Remove" />
        </RadioGroup>
      </FormControl>
      <Button variant="outlined" sx={{backgroundColor: 'white', maxHeight: '4rem', marginTop: '1rem'}} onClick={() => resetClicks()}>Reset Selection</Button>
      </Stack>
    </Stack>
  );
};

export default Stage;
